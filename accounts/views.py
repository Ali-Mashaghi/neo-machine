from django.contrib.auth.views import LoginView
from .forms import LoginForm


class CustomLoginView(LoginView):

    template_name = 'login.html'
    authentication_form = LoginForm
    redirect_authenticated_user = True

    def get_success_url(self):
        return '/panel/'