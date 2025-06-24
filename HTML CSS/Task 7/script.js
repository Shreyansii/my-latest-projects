const steps = document.querySelectorAll('.form-step');
const indicators = document.querySelectorAll('.step');
let currentStep = 0;

function updateSteps() {
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === currentStep);
    indicators[i].classList.toggle('active', i === currentStep);
  });
  document.documentElement.style.setProperty('--progress', `${(currentStep + 1) / steps.length * 100}%`);
}

function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep++;
    updateSteps();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    updateSteps();
  }



//for carttt and local storage

function saveToCart(data) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(data);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById('cartItems');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cartList.innerHTML = '';
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${item.fullname} (${item.payment})`;
    cartList.appendChild(li);
  });
}

document.getElementById('checkoutForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    fullname: form.fullname.value,
    email: form.email.value,
    address: form.address.value,
    payment: form.payment.value
  };
  saveToCart(data);
  alert("Order submitted and saved to cart!");
  form.reset();
  currentStep = 0;
  updateSteps();
});

// forr cart load
window.addEventListener('DOMContentLoaded', renderCart);














}

// Simulate cart with localStorage
const cart = [
  { id: 1, name: "Product A", quantity: 2 },
  { id: 2, name: "Product B", quantity: 1 }
];
localStorage.setItem('cart', JSON.stringify(cart));

document.getElementById('checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  alert("Order submitted! Check console for cart data.");
  console.log("Cart:", JSON.parse(localStorage.getItem('cart')));
});
