
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Expense
from .serializers import (
    ExpenseListSerializer,
    ExpenseDetailSerializer,
    ExpenseCreateUpdateSerializer
)
from .utils import get_group_balances, get_settlement_suggestions, get_user_expense_breakdown
from core.utils import log_activity


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ExpenseListSerializer
        elif self.action == 'retrieve':
            return ExpenseDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ExpenseCreateUpdateSerializer
        return ExpenseDetailSerializer

    def get_queryset(self):
        # Avoid error during schema generation
        if getattr(self, "swagger_fake_view", False):
            return Expense.objects.none()
        user = self.request.user
        return Expense.objects.filter(group__members=user, is_active=True)

    @extend_schema(description="Get balances for the group related to this expense")
    @action(detail=True, methods=['get'])
    def balances(self, request, pk=None):
        expense = self.get_object()
        balances = get_group_balances(expense.group)
        return Response(balances)

    @extend_schema(description="Get settlement suggestions for the group related to this expense")
    @action(detail=True, methods=['get'])
    def settlements(self, request, pk=None):
        expense = self.get_object()
        settlements = get_settlement_suggestions(expense.group)
        return Response(settlements)

    @extend_schema(description="Get the logged-in user's expense breakdown in the group")
    @action(detail=True, methods=['get'])
    def my_breakdown(self, request, pk=None):
        expense = self.get_object()
        breakdown = get_user_expense_breakdown(expense.group, request.user)
        return Response(breakdown)

   
    def perform_create(self, serializer):
        # 1. Save the new expense instance
        expense = serializer.save(created_by=self.request.user)

        # 2. Log the activity using the newly created expense object
        log_activity(
            user=self.request.user,
            group=expense.group,
            action_type='expense_creation',
            ref_table='expense',
            ref_obj=expense.description,
            ref_id=expense.id
        )
