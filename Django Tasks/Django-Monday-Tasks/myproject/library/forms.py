from django import forms
from .models import Author, Publisher, Book, Member, Borrowing

class AuthorForm(forms.ModelForm):
    class Meta:
        model = Author
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'birth_date': forms.DateInput(attrs={'type': 'date', 'class': 'w-full border border-black rounded px-3 py-2'}),
            'nationality': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
        }

class PublisherForm(forms.ModelForm):
    class Meta:
        model = Publisher
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'address': forms.Textarea(attrs={'class': 'w-full border border-black rounded px-3 py-2', 'rows': 3}),
            'contact_info': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
        }

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = '__all__'
        widgets = {
            'title': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'isbn': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'author': forms.Select(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'publisher': forms.Select(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'publication_date': forms.DateInput(attrs={'type': 'date', 'class': 'w-full border border-black rounded px-3 py-2'}),
        }

class MemberForm(forms.ModelForm):
    class Meta:
        model = Member
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'email': forms.EmailInput(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'membership_date': forms.DateInput(attrs={'type': 'date', 'class': 'w-full border border-black rounded px-3 py-2'}),
        }

class BorrowingForm(forms.ModelForm):
    class Meta:
        model = Borrowing
        fields = '__all__'
        widgets = {
            'book': forms.Select(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'member': forms.Select(attrs={'class': 'w-full border border-black rounded px-3 py-2'}),
            'borrow_date': forms.DateInput(attrs={'type': 'date', 'class': 'w-full border border-black rounded px-3 py-2'}),
            'return_date': forms.DateInput(attrs={'type': 'date', 'class': 'w-full border border-black rounded px-3 py-2'}),
            'is_returned': forms.CheckboxInput(attrs={'class': 'h-5 w-5 text-indigo-600'}),
        }
