from .models import ActivityLog

def log_activity(user, action_type, ref_table, ref_id, description, group=None):
    """
    Utility function to log user activities.
    """
    ActivityLog.objects.create(
        user=user,
        group=group,
        type=action_type,
        ref_table=ref_table,
        ref_id=ref_id,
        description=description
    )

def calculate_balances(group):
    """
    Calculate balances for all members in a group.
    Returns dict with user_id as key and balance as value.
    """
    from expenses.models import Expense
    from settlements.models import Settlement
    
    balances = {}
    members = group.members.all()
    
    # Initialize balances
    for member in members:
        balances[member.id] = 0
    
    # Add expenses
    expenses = Expense.objects.filter(group=group, is_active=True)
    for expense in expenses:
        # Person who paid gets positive balance
        balances[expense.by_user.id] += expense.amount
        
        # Split among participants (including payer)
        participants = expense.for_user.all()
        if participants.exists():
            split_amount = expense.amount / participants.count()
            for participant in participants:
                balances[participant.id] -= split_amount
    
    # Subtract settlements
    settlements = Settlement.objects.filter(group=group)
    for settlement in settlements:
        balances[settlement.by_user.id] -= settlement.amount
        balances[settlement.for_user.id] += settlement.amount
    
    return balances

def suggest_settlements(group):
    """
    Suggest optimal settlements to minimize transactions.
    """
    balances = calculate_balances(group)
    
    # Separate creditors and debtors
    creditors = [(user_id, amount) for user_id, amount in balances.items() if amount > 0.01]
    debtors = [(user_id, abs(amount)) for user_id, amount in balances.items() if amount < -0.01]
    
    settlements = []
    
    # Sort by amount (descending)
    creditors.sort(key=lambda x: x[1], reverse=True)
    debtors.sort(key=lambda x: x[1], reverse=True)
    
    i, j = 0, 0
    while i < len(creditors) and j < len(debtors):
        creditor_id, credit = creditors[i]
        debtor_id, debt = debtors[j]
        
        amount = min(credit, debt)
        
        settlements.append({
            'from_user': debtor_id,
            'to_user': creditor_id,
            'amount': round(amount, 2)
        })
        
        creditors[i] = (creditor_id, credit - amount)
        debtors[j] = (debtor_id, debt - amount)
        
        if creditors[i][1] <= 0.01:
            i += 1
        if debtors[j][1] <= 0.01:
            j += 1
    
    return settlements