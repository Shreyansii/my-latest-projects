
#The core logic for dividing an expense.


from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from django.contrib.auth import get_user_model

User = get_user_model()

def calculate_split_amounts(total_amount, split_type, participants_data):
    """Calculate split amounts based on split type"""
    if split_type == 'equal':
        return _calculate_equal_split(total_amount, participants_data)
    elif split_type == 'unequal':
        return _validate_unequal_split(total_amount, participants_data)
    elif split_type == 'percentage':
        return _calculate_percentage_split(total_amount, participants_data)
    elif split_type == 'shares':
        return _calculate_shares_split(total_amount, participants_data)

def _calculate_equal_split(total_amount, participants_data):
    num_participants = len(participants_data)
    base_amount = (total_amount / num_participants).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    calculated_total = base_amount * num_participants
    #Because rounding can introduce a small error, 
    # the difference is added to the first participant to ensure the total sums exactly.
    difference = total_amount - calculated_total
    
    result = []
    for i, participant in enumerate(participants_data):
        amount = base_amount + (difference if i == 0 else Decimal('0.00'))
        result.append({
            'user_id': participant['user_id'],
            'amount': amount,
            'percentage': None,
            'shares': None
        })
    return result

def _validate_unequal_split(total_amount, participants_data):
    total_specified = sum(Decimal(str(p['amount'])) for p in participants_data)
    if total_specified != total_amount:
        raise ValueError(f"Total amounts must equal {total_amount}")
    return [{
        'user_id': p['user_id'],
        'amount': Decimal(str(p['amount'])),
        'percentage': None,
        'shares': None
    } for p in participants_data]

def _calculate_percentage_split(total_amount, participants_data):
    total_percentage = sum(Decimal(str(p['percentage'])) for p in participants_data)
    if abs(total_percentage - 100) > Decimal('0.01'):
        raise ValueError("Percentages must sum to 100%")
    
    result = []
    calculated_total = Decimal('0.00')
    for i, participant in enumerate(participants_data):
        percentage = Decimal(str(participant['percentage']))
        if i == len(participants_data) - 1: # leftover goes to LAST user
            amount = total_amount - calculated_total
        else:
            amount = (total_amount * percentage / 100).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            calculated_total += amount
        
        result.append({
            'user_id': participant['user_id'],
            'amount': amount,
            'percentage': percentage,
            'shares': None
        })
    return result

def _calculate_shares_split(total_amount, participants_data):
    total_shares = sum(int(p['shares']) for p in participants_data)
    result = []
    calculated_total = Decimal('0.00')
    
    for i, participant in enumerate(participants_data):
        shares = int(participant['shares'])
        if i == len(participants_data) - 1:
            amount = total_amount - calculated_total
        else:
            amount = (total_amount * shares / total_shares).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            calculated_total += amount
        
        result.append({
            'user_id': participant['user_id'],
            'amount': amount,
            'percentage': None,
            'shares': shares
        })
    return result

def get_group_balances(group):
    #balances table
    """Calculate comprehensive balances for all group members"""
    balances = {}
    
    # Initialize balances
    for member in group.members.all():
        balances[member.id] = {
            'user': member,
            'paid': Decimal('0.00'),
            'owes': Decimal('0.00'),
            'net_balance': Decimal('0.00')
        }
    
    # Calculate paid amounts
    for expense in group.expenses.filter(is_active=True).select_related('paid_by'):
        paid_by_id = expense.paid_by.id
        if paid_by_id in balances:
            balances[paid_by_id]['paid'] += expense.amount
    
    # Calculate owed amounts
    from .models import ExpenseParticipant #for  no circular imports
    participants = ExpenseParticipant.objects.filter(
        expense__group=group,
        expense__is_active=True
    ).select_related('user', 'expense')
    
    for participant in participants:
        user_id = participant.user.id
        if user_id in balances:
            balances[user_id]['owes'] += participant.amount
    
    # Calculate net balances
    for user_id, balance_data in balances.items():
        balance_data['net_balance'] = balance_data['paid'] - balance_data['owes']
    
    return balances

def get_settlement_suggestions(group):
    """Generate optimized settlement suggestions"""
    balances = get_group_balances(group)
    
    creditors = []
    debtors = []
    
    for user_id, balance_data in balances.items():
        net_balance = balance_data['net_balance']
        if net_balance > Decimal('0.01'):
            creditors.append({
                'user_id': user_id,
                'user': balance_data['user'],
                'amount': net_balance
            })
        elif net_balance < Decimal('-0.01'):
            debtors.append({
                'user_id': user_id,
                'user': balance_data['user'],
                'amount': abs(net_balance)
            })
    
    #on the basis of amount sort in desc i.e largest to smallest
    creditors.sort(key=lambda x: x['amount'], reverse=True)
    debtors.sort(key=lambda x: x['amount'], reverse=True)
    
    suggestions = []
    while creditors and debtors:
        creditor = creditors[0]
        debtor = debtors[0]
        
        settlement_amount = min(creditor['amount'], debtor['amount'])
        #ensures transactions never overpay or underpay
        
        suggestions.append({
            'from_user_id': debtor['user_id'],
            'from_user': debtor['user'],
            'to_user_id': creditor['user_id'],
            'to_user': creditor['user'],
            'amount': settlement_amount
        })
        
        creditor['amount'] -= settlement_amount
        debtor['amount'] -= settlement_amount
        
        if creditor['amount'] <= Decimal('0.01'):
            creditors.pop(0)
            #pop removes the creditor or debtor from the "still needs to settle" list
        if debtor['amount'] <= Decimal('0.01'):
            debtors.pop(0)
    
    return suggestions

def get_user_expense_breakdown(group, user):
    """Get detailed expense breakdown for a user in a group"""
    from .models import ExpenseParticipant
    
    # Expenses paid by user
    paid_expenses = group.expenses.filter(paid_by=user, is_active=True)
    
    # Expenses user participated in
    participated_expenses = ExpenseParticipant.objects.filter(
        user=user,
        expense__group=group,
        expense__is_active=True
    ).select_related('expense')
    
    return {
        'paid_count': paid_expenses.count(),
        'paid_total': sum(exp.amount for exp in paid_expenses),
        'participated_count': participated_expenses.count(),
        'owed_total': sum(part.amount for part in participated_expenses),
        'paid_expenses': paid_expenses,
        'participated_expenses': participated_expenses
    }