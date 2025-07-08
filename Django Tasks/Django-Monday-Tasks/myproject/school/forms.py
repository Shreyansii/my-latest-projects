from django import forms
from .models import Department, Course, Student, Enrollment


class DepartmentForm(forms.ModelForm):
    class Meta:
        model = Department
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full border border-black rounded px-3 py-2'
            }),
            'code': forms.TextInput(attrs={
                'class': 'w-full border border-black rounded px-3 py-2'
            }),
            'head_of_department': forms.TextInput(attrs={
                'class': 'w-full border border-black rounded px-3 py-2'
            }),
        }


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = '__all__'
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'w-full border border-black rounded px-3 py-2'
            }),
            'code': forms.TextInput(attrs={
                'class': 'w-full border border-black rounded px-3 py-2'
            }),
            'credits': forms.NumberInput(attrs={
                'class': 'w-full border border-black rounded px-3 py-2'
            }),
            'department': forms.Select(attrs={
                'class': 'w-full border border-black rounded px-3 py-2'
            }),
        }




class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'email': forms.EmailInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'enrollment_date': forms.DateInput(attrs={
                'type': 'date',
                'class': 'w-full border border-black rounded px-3 py-2'
            }),
            'department': forms.Select(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
        }


class EnrollmentForm(forms.ModelForm):
    class Meta:
        model = Enrollment
        fields = '__all__'
        widgets = {
            'student': forms.Select(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'course': forms.Select(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'enrollment_date': forms.DateInput(attrs={
                'type': 'date', 'class': 'w-full border border-black rounded px-3 py-2'
            }),
            'grade': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
        }
