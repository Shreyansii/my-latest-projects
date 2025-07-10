from rest_framework import serializers
from .models import Author, Publisher, Book, Member, Borrowing

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    publisher = PublisherSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(queryset=Author.objects.all(), source='author', write_only=True)
    publisher_id = serializers.PrimaryKeyRelatedField(queryset=Publisher.objects.all(), source='publisher', write_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'isbn', 'publication_date', 'author', 'publisher', 'author_id', 'publisher_id']

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

class BorrowingSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    member = MemberSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), source='book', write_only=True)
    member_id = serializers.PrimaryKeyRelatedField(queryset=Member.objects.all(), source='member', write_only=True)

    class Meta:
        model = Borrowing
        fields = ['id', 'borrow_date', 'return_date', 'is_returned', 'book', 'member', 'book_id', 'member_id']
