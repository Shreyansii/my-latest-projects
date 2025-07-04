from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render

from employees.models import Employee

# View to show details of a single employee
def employee_detail(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    context = {
        'employee': employee,
    }
    return render(request, 'employee_detail.html', context)

# View to show list of all employees
def home(request):
    employees = Employee.objects.all()
    context = {
        'employees': employees,
    }
    return render(request, 'home.html', context)
