from django.shortcuts import render, get_object_or_404, redirect
from .models import Book, Member, Borrowing
from .forms import BookForm, BorrowingForm
from django.urls import reverse


def library_home(request):
    return render(request, 'library/library_home.html')


def book_list(request):
    books = Book.objects.select_related('author', 'publisher').all()
    return render(request, 'library/book_list.html', {'books': books})

def add_book(request):
    form = BookForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('book_list')
    return render(request, 'library/add_book.html', {
        'form': form,
        'form_title': 'Add New Book',
        'button_text': 'Add Book'
    })

def edit_book(request, pk):
    book = get_object_or_404(Book, pk=pk)
    form = BookForm(request.POST or None, instance=book)
    if form.is_valid():
        form.save()
        return redirect('book_list')
    return render(request, 'library/add_book.html', {
        'form': form,
        'form_title': 'Edit Book',
        'button_text': 'Update Book'
    })

def delete_book(request, pk):
    book = get_object_or_404(Book, pk=pk)
    if request.method == "POST":
        book.delete()
        return redirect('book_list')
    return render(request, 'library/confirm_delete.html', {'object': book})

def borrowing_list(request):
    borrowings = Borrowing.objects.select_related('book', 'member').all()
    return render(request, 'library/borrowing_list.html', {'borrowings': borrowings})

def add_borrowing(request):
    form = BorrowingForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('borrowing_list')
    return render(request, 'library/add_borrowing.html', {'form': form})

def mark_returned(request, pk):
    borrowing = get_object_or_404(Borrowing, pk=pk)
    borrowing.is_returned = True
    borrowing.save()
    return redirect('borrowing_list')
