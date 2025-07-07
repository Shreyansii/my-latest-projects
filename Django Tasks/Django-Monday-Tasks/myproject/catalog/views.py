from django.shortcuts import render, redirect, get_object_or_404
from .models import Product, Brand, Category
from .forms import ProductForm

def product_list(request):
    brand_id = request.GET.get('brand')
    category_id = request.GET.get('category')

    products = Product.objects.all()
    if brand_id:
        products = products.filter(brand_id=brand_id)
    if category_id:
        products = products.filter(category_id=category_id)

    brands = Brand.objects.all()
    categories = Category.objects.all()

    return render(request, 'catalog/product_list.html', {
        'products': products,
        'brands': brands,
        'categories': categories
    })

def product_create(request):
    form = ProductForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('product_list')
    return render(request, 'catalog/product_form.html', {'form': form})

def product_update(request, pk):
    product = get_object_or_404(Product, pk=pk)
    form = ProductForm(request.POST or None, instance=product)
    if form.is_valid():
        form.save()
        return redirect('product_list')
    return render(request, 'catalog/product_form.html', {'form': form})

def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        product.delete()
        return redirect('product_list')
    return render(request, 'catalog/product_confirm_delete.html', {'product': product})


# Create your views here.
