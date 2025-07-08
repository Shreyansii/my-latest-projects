# from django.shortcuts import render, redirect
# from .models import Student
# from .forms import StudentForm

# def student_list(request):
#     students = Student.objects.all()
#     return render(request, 'school/student_list.html', {'students': students})

# def student_create(request):
#     form = StudentForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('student_list')
#     return render(request, 'school/student_form.html', {'form': form})

# from django.shortcuts import render, redirect, get_object_or_404
# from .models import Department, Course, Student, Enrollment
# from .forms import DepartmentForm, CourseForm, StudentForm, EnrollmentForm



# def school_home(request):
#     return render(request, 'school/school_home.html')


# #  Department 
# def department_list(request):
#     departments = Department.objects.all()
#     return render(request, 'school/department_list.html', {'departments': departments})

# def department_create(request):
#     form = DepartmentForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('department_list')
#     return render(request, 'school/department_form.html', {'form': form})

# # Course 
# def course_list(request):
#     courses = Course.objects.all()
#     return render(request, 'school/course_list.html', {'courses': courses})

# def course_create(request):
#     form = CourseForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('course_list')
#     return render(request, 'school/course_form.html', {'form': form})

# # Student 
# def student_list(request):
#     students = Student.objects.all()
#     return render(request, 'school/student_list.html', {'students': students})

# def student_create(request):
#     form = StudentForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('student_list')
#     return render(request, 'school/student_form.html', {'form': form})

# # Enrollment 
# def enrollment_list(request):
#     enrollments = Enrollment.objects.select_related('student', 'course')
#     return render(request, 'school/enrollment_list.html', {'enrollments': enrollments})

# def enrollment_create(request):
#     form = EnrollmentForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('enrollment_list')
#     return render(request, 'school/enrollment_form.html', {'form': form})

from django.shortcuts import render, redirect, get_object_or_404
from .models import Department, Course, Student, Enrollment
from .forms import DepartmentForm, CourseForm, StudentForm, EnrollmentForm
from datetime import date


def school_home(request):
    return render(request, 'school/school_home.html')


# ---------- Department ----------
def department_list(request):
    departments = Department.objects.all()
    return render(request, 'school/department_list.html', {'departments': departments})

def department_create(request):
    form = DepartmentForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('department_list')
    return render(request, 'school/department_form.html', {'form': form})


# ---------- Course ----------
def course_list(request):
    courses = Course.objects.all()
    return render(request, 'school/course_list.html', {'courses': courses})

def course_create(request):
    form = CourseForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('course_list')
    return render(request, 'school/course_form.html', {'form': form})


# ---------- Student ----------
def student_list(request):
    students = Student.objects.all()
    return render(request, 'school/student_list.html', {'students': students})

def student_create(request):
    form = StudentForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('student_list')
    return render(request, 'school/student_form.html', {'form': form})

def student_update(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    old_department = student.department
    form = StudentForm(request.POST or None, instance=student)
    if form.is_valid():
        updated_student = form.save()
        # If department changed, remove enrollments not in new department
        if old_department != updated_student.department:
            Enrollment.objects.filter(
                student=updated_student
            ).exclude(course__department=updated_student.department).delete()
        return redirect('student_list')
    return render(request, 'school/student_form.html', {'form': form})


# ---------- Enrollment ----------
def enrollment_list(request):
    enrollments = Enrollment.objects.select_related('student', 'course')
    return render(request, 'school/enrollment_list.html', {'enrollments': enrollments})

def enrollment_create(request):
    form = EnrollmentForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('enrollment_list')
    return render(request, 'school/enrollment_form.html', {'form': form})

def enrollment_delete(request, enrollment_id):
    enrollment = get_object_or_404(Enrollment, id=enrollment_id)
    enrollment.delete()
    return redirect('enrollment_list')
