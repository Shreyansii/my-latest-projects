from rest_framework.throttling import SimpleRateThrottle

class ForgotPasswordThrottle(SimpleRateThrottle):
    scope = 'forgot_password'

    def get_cache_key(self, request, view):
        email = request.data.get('email')
        if email:
            return f"forgot-password:{email.lower()}"  #returns unique cache key to keep track
        return None  # No throttling if no email provided 


class ResendVerificationThrottle(SimpleRateThrottle):
    scope = 'resend_verification'

    def get_cache_key(self, request, view):
        return self.get_ident(request)  # Use IP (cause unauthenicated can also send)
