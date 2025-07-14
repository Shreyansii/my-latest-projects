from rest_framework import viewsets
from .models import Author, Category, Post
from .serializers import AuthorSerializer, CategorySerializer, PostSerializer
from .permissions import IsAdminOrReadOnly

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related('author', 'category').all()
    serializer_class = PostSerializer
    permission_classes = [IsAdminOrReadOnly]
