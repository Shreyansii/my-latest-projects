from rest_framework import serializers
from .models import Author, Category, Post

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    # Read-only nested display
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    # Write-only foreign key IDs
    author_id = serializers.PrimaryKeyRelatedField(queryset=Author.objects.all(), source='author', write_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content',
            'author', 'category',         # read-only
            'author_id', 'category_id',   # write-only
            'created_at', 'updated_at'
        ]
