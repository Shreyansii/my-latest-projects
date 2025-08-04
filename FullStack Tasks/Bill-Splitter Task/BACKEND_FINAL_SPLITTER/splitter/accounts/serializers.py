from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Settings
from django.core.mail import send_mail


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        Settings.objects.create(user=user)
        return user
    


      # Generate verification token
        verification_token = get_random_string(32)
        user.reset_token = verification_token  
        user.reset_token_exp = timezone.now() + timedelta(hours=24)
        user.save()
        
        # Send verification email
        self.send_verification_email(user, verification_token)
        return user
       
     
    
    def send_verification_email(self, user, token):
        verification_link = f"http://localhost:3000/verify-email/{token}"
        send_mail(
        'Verify your email - Splitter App',
        f'Hi {user.first_name or user.username},\n\n'
        f'Thank you for signing up for Splitter!\n'  
        f'Please click the link below to verify your email address:\n\n'
        f'{verification_link}\n\n'
        f'This link will expire in 24 hours.\n\n'
        f'If you didn\'t create this account, please ignore this email.\n\n'
        f'Best regards,\nThe Splitter Team',
        'noreply@splitter.com',  # app's email
        [user.email],
    )

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'avatar_url', 'is_verified', 'created_at')
        read_only_fields = ('id', 'is_verified', 'created_at')

class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = '__all__'
        read_only_fields = ('user',)

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
