from rest_framework import viewsets
from .models import Author, Publisher, Book, Member, Borrowing
from .serializers import AuthorSerializer, PublisherSerializer, BookSerializer, MemberSerializer, BorrowingSerializer
from .permissions import IsAdminOrReadOnly

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminOrReadOnly]

class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [IsAdminOrReadOnly]

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('author', 'publisher').all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminOrReadOnly]

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAdminOrReadOnly]

class BorrowingViewSet(viewsets.ModelViewSet):
    queryset = Borrowing.objects.select_related('book', 'member').all()
    serializer_class = BorrowingSerializer
    permission_classes = [IsAdminOrReadOnly]
