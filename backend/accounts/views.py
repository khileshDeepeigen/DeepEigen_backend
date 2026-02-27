from django.shortcuts import render, redirect, get_object_or_404
from .forms import UserForm, UserProfileForm
from .models import *
from course.models import *
from django.contrib import messages, auth
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse,HttpRequest,JsonResponse
from utils.decorators import api_login_required
from datetime import datetime, date,timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone

from django.db.models import Exists,Count
# Verification email
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
import requests
from django.template import RequestContext
from django import template
# from Invoice.models import *
from django.views.decorators.csrf import csrf_protect
from django.db import connection

#### Invoice as pdf 
from django.http import FileResponse

import inflect
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
import io
import reportlab
from django.conf import settings
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from deepeigen import *
from reportlab.lib.units import *
from django.core.files import File as DjangoFile
from django.core.files.base import ContentFile
from django.db.models import Q
from django.db.models import Sum

from course.models import EnrolledUser, Course


# for changing to json output
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from decimal import Decimal
from django.utils.timezone import now




# ==================== NEW JSON VERSION ====================
@csrf_protect
def register(request):
    """
    API endpoint for user registration
    Returns JSON response with user details and status
    Matches Account model fields: first_name, last_name, username, email, password, phone_number, profession, country
    """
    if request.method == 'POST':
        try:
            import json
            # Handle both JSON and form-data requests
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                first_name = data.get('first_name', '').strip()
                last_name = data.get('last_name', '').strip()
                username = data.get('username', '').strip()
                email = data.get('email', '').strip()
                password = data.get('password', '').strip()
                confirm_password = data.get('confirm_password', '').strip()
                phone_number = data.get('phone_number', '').strip() or None
                profession = data.get('profession', '').strip()
                country = data.get('country', '').strip()
            else:
                first_name = request.POST.get('first_name', '').strip()
                last_name = request.POST.get('last_name', '').strip()
                username = request.POST.get('username', '').strip()
                email = request.POST.get('email', '').strip()
                password = request.POST.get('password', '').strip()
                confirm_password = request.POST.get('confirm_password', '').strip()
                phone_number = request.POST.get('phone_number', '').strip() or None
                profession = request.POST.get('profession', '').strip()
                country = request.POST.get('country', '').strip()

            # Validation: Check required fields
            required_fields = ['first_name', 'last_name', 'username', 'email', 'password', 'confirm_password', 'profession', 'country']
            for field in required_fields:
                if not locals()[field] or (field != 'phone_number' and field != 'country' and not locals()[field]):
                    return JsonResponse({
                        'success': False,
                        'message': f'{field.replace("_", " ").title()} is required',
                        'status': 400
                    }, status=400)

            # Validation: Password match
            if password != confirm_password:
                return JsonResponse({
                    'success': False,
                    'message': 'Password does not match',
                    'status': 400
                }, status=400)

            # Validation: Username already exists
            if Account.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Username already exists',
                    'status': 400
                }, status=400)

            # Validation: Email already exists
            if Account.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already exists',
                    'status': 400
                }, status=400)

            # Create user with all Account model fields
            user = Account.objects.create_user(
                first_name=first_name,
                last_name=last_name,
                username=username,
                email=email,
                password=password,
                phone_number=phone_number,
                profession=profession,
                country=country
            )
            user.save()

            # Create user profile with default picture
            profile = UserProfile()
            profile.user_id = user.id
            profile.profile_picture = 'default/default_user.png'
            profile.save()

            # Generate activation token
            current_site = get_current_site(request)
            mail_subject = 'Please activate your Deep Eigen account'
            email_context = {
                'user': user,
                'domain': current_site,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            }

            # Send activation email
            plain_message = render_to_string('accounts/account_verification_email.txt', email_context)
            html_message = render_to_string('accounts/account_verification_email.html', email_context)
            to_email = email
            from_email = settings.EMAIL_HOST_USER
            send_mail(mail_subject, plain_message, from_email, [to_email], html_message=html_message)

            # Return success response with user details
            return JsonResponse({
                'success': True,
                'message': 'Registration successful. Verification email sent to your email address.',
                'status': 201,
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'username': user.username,
                    'email': user.email,
                    'phone_number': user.phone_number,
                    'profession': user.profession,
                    'country': user.country,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined.isoformat()
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Registration failed: {str(e)}',
                'status': 500
            }, status=500)

    elif request.method == 'GET':
        # Return allowed methods info
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a POST request.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)

    else:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed',
            'status': 405
        }, status=405)
# ==================== END OF NEW JSON VERSION ====================


@csrf_protect
def register_mannual(request):
    data = {
        'title': 'User Registration | Deep Eigen',
        'description': "Deep Eigen course enrollment is easy by registering as a user by inputting few basic information.",
        'canonical_url' : request.build_absolute_uri(request.path)
    }
    if request.method == 'POST':
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']
        phone_number = request.POST.get('phone_number')
        profession = request.POST['profession']
        country = request.POST['country']
        
        if password == confirm_password:
            if Account.objects.filter(username=username).exists():
                messages.error(request, 'Username already exists')
                return redirect('manual_registration')
            elif Account.objects.filter(email=email).exists():
                messages.error(request, 'Email already exists') 
                return redirect('manual_registration')
            else:
                user = Account.objects.create_user(first_name=first_name, last_name=last_name,
                                            username=username, email=email, password=password,
                                            phone_number=phone_number, profession=profession,
                                            country=country
                                            )
                user.is_active = True
                user.save()
        else:
            messages.error(request, 'Password do not match')
            return redirect('manual_registration')

            # Create a user profile
        profile = UserProfile()
        profile.user_id = user.id
        profile.profile_picture = 'default/default_user.png'
        profile.save()

        # USER ACTIVATION
        # current_site = get_current_site(request)
        # mail_subject = 'Please activate your Deep Eigen account'
        # data = { 
        #     'user': user,
        #     'domain': current_site,
        #     'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        #     'token': default_token_generator.make_token(user),
        #     }
        # plain_message = render_to_string('accounts/account_verification_email.txt', data)
        # html_message = render_to_string('accounts/account_verification_email.html', data)
        # to_email = email
        # from_email = settings.EMAIL_HOST_USER
        # send_mail(mail_subject, plain_message, from_email, [to_email], html_message=html_message)

        messages.success(request, 'Registration Successfull')
        return redirect('manual_registration')
    return render(request, 'courses/manual_registration.html', data)


# ==================== NEW JSON VERSION ====================
@csrf_protect
def login(request):
    """
    API endpoint for user login
    Returns JSON response with user details, authentication token, and pending course installments
    Matches Account model fields: email, password (and returns other fields)
    """
    if request.method == 'POST':
        try:
            import json
            # Handle both JSON and form-data requests
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                email = data.get('email', '').strip()
                password = data.get('password', '').strip()
            else:
                email = request.POST.get('email', '').strip()
                password = request.POST.get('password', '').strip()

            # Validation: Check required fields
            if not email or not password:
                return JsonResponse({
                    'success': False,
                    'message': 'Email and password are required',
                    'status': 400
                }, status=400)

            # Authenticate user with email and password
            user = auth.authenticate(email=email, password=password)

            if user is not None:
                # Check if user is active (email verified)
                if not user.is_active:
                    return JsonResponse({
                        'success': False,
                        'message': 'Account not activated. Please verify your email first.',
                        'status': 403
                    }, status=403)

                # Login the user (create session)
                auth.login(request, user)

                # Fetch enrolled users and pending installments
                enrolled_users = EnrolledUser.objects.filter(user=user)
                course_data = []

                if enrolled_users.exists():
                    for enrolled_user in enrolled_users:
                        course_section = []

                        # Check for pending installments (2nd, 3rd)
                        if enrolled_user.no_of_installments > 1:
                            if enrolled_user.no_of_installments == 2:
                                if not enrolled_user.second_installments:
                                    course_section.append({
                                        'course_name': enrolled_user.course.title,
                                        'course_price': round(enrolled_user.course_price/2, 2),
                                        'course_id': enrolled_user.course.id,
                                        'course_link': enrolled_user.course.url_link_name,
                                        'installment': 'Second Installment'
                                    })

                            elif enrolled_user.no_of_installments == 3:
                                if not enrolled_user.second_installments:
                                    course_section.append({
                                        'course_name': enrolled_user.course.title,
                                        'course_price': round(enrolled_user.course_price/3, 2),
                                        'course_id': enrolled_user.course.id,
                                        'course_link': enrolled_user.course.url_link_name,
                                        'installment': 'Second Installment'
                                    })

                                elif enrolled_user.second_installments and not enrolled_user.third_installments:
                                    course_section.append({
                                        'course_name': enrolled_user.course.title,
                                        'course_price': round(enrolled_user.course_price/3, 2),
                                        'course_id': enrolled_user.course.id,
                                        'course_link': enrolled_user.course.url_link_name,
                                        'installment': 'Third Installment'
                                    })

                        course_data.extend(course_section)

                # Store course data in session
                request.session['course_data'] = course_data

                # Return success response with user and course details
                return JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                    'status': 200,
                    'user': {
                        'id': user.id,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'username': user.username,
                        'email': user.email,
                        'phone_number': user.phone_number,
                        'profession': user.profession,
                        'country': user.country,
                        'is_active': user.is_active,
                        'is_staff': user.is_staff,
                        'is_superadmin': user.is_superadmin,
                        'date_joined': user.date_joined.isoformat(),
                        'last_login': user.last_login.isoformat() if user.last_login else None
                    },
                    'pending_courses': course_data,
                    'session_id': request.session.session_key
                }, status=200)
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid email or password',
                    'status': 401
                }, status=401)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Login failed: {str(e)}',
                'status': 500
            }, status=500)

    elif request.method == 'GET':
        # Return allowed methods info
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a POST request.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)

    else:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed',
            'status': 405
        }, status=405)


@ensure_csrf_cookie
def get_csrf(request):
    """
    Endpoint to ensure CSRF cookie is set and return token for SPA clients.
    Frontend should call GET /accounts/csrf/ before making POST requests.
    """
    token = get_token(request)
    return JsonResponse({"csrfToken": token})
# ==================== END OF NEW JSON VERSION ====================




@csrf_protect
def login_mannual(request):
    data = {
        'title': 'User Login | Deep Eigen',
        'description': "Deep Eigen course access is easy by logging in as a user.",
        'canonical_url': request.build_absolute_uri(request.path)
    }
    
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        user = auth.authenticate(email=email, password=password)

        if user is not None:
            # Check if the user is staff or super admin
            if not (user.is_staff or user.is_superadmin):
                messages.error(request, 'You must be a staff member or super admin to access this page.')
                return redirect('login_mannual')

            auth.login(request, user)
            messages.success(request, 'You are now logged in.')

            # Since you want to remove the enrolled_users related logic, we don't process courses anymore
            # You can directly redirect to the dashboard or any other page
            url = request.META.get('HTTP_REFERER')
            try:
                query = requests.utils.urlparse(url).query
                params = dict(x.split('=') for x in query.split('&'))
                if 'next' in params:
                    nextPage = params['next']
                    return redirect(nextPage)
            except:
                return redirect('dashboard')
        else:
            messages.error(request, 'Invalid login credentials')
            return redirect('login_mannual')

    return render(request, 'accounts/mannual_login.html', data)


# ==================== OLD HTML VERSION (COMMENTED OUT) ====================
# @login_required(login_url = 'login')
# def logout(request):
#     auth.logout(request)
#     messages.success(request, 'You are logged out.')
#     return redirect('login')
# ==================== END OF OLD HTML VERSION ====================


# ==================== NEW JSON VERSION ====================
@api_login_required
@csrf_protect
def logout(request):
    """
    API endpoint for user logout
    Returns JSON response confirming logout and clears session
    POST only - GET not allowed for security
    """
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a POST request.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)
    
    try:
            # Get user info before logout for response
            user_email = request.user.email if request.user.is_authenticated else None
            
            # Clear session and logout user
            auth.logout(request)
            
            return JsonResponse({
                'success': True,
                'message': 'Logged out successfully',
                'status': 200,
                'user_email': user_email,
                'session_cleared': True
            }, status=200)

    except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Logout failed: {str(e)}',
                'status': 500
            }, status=500)
# ==================== END OF NEW JSON VERSION ====================

# ==================== NEW JSON VERSION ====================
def activate(request, uidb64, token):
    """
    API endpoint for email account activation
    Returns JSON response confirming account activation status
    Takes URL parameters: uidb64 (user id encoded), token (verification token)
    """
    try:
        # Decode the user ID from the base64 encoded string
        uid = urlsafe_base64_decode(uidb64).decode()
        user = Account._default_manager.get(pk=uid)
    except(TypeError, ValueError, OverflowError, Account.DoesNotExist) as e:
        # Invalid or expired activation link
        return JsonResponse({
            'success': False,
            'message': 'Invalid or expired activation link',
            'status': 400,
            'error_type': 'invalid_token'
        }, status=400)

    # Verify the token is valid
    if user is not None and default_token_generator.check_token(user, token):
        # Token is valid, activate the user
        user.is_active = True
        user.save()

        return JsonResponse({
            'success': True,
            'message': 'Congratulations! Your account has been activated successfully.',
            'status': 200,
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number,
                'profession': user.profession,
                'country': user.country,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat()
            }
        }, status=200)
    else:
        # Token is invalid or expired
        return JsonResponse({
            'success': False,
            'message': 'Invalid or expired activation link. Please request a new verification email.',
            'status': 401,
            'error_type': 'invalid_or_expired_token'
        }, status=401)
# ==================== END OF NEW JSON VERSION ====================


    # New Code written by khilesh (Date - 31_Dec_2024) 
def Admin_verfiy(admin):

    if admin.is_superadmin:
        courses=Course.objects.all()
        userprofile=Account.objects.get(id=admin.id)
    
    elif not admin.is_superadmin and admin.is_staff:
        ta_admin=TeachingAssistant.objects.filter(email=admin.email)
        courses=ta_admin[0].course_set.all()
        userprofile=Account.objects.get(id=admin.id)
    else:
        # Use filter().first() so missing UserProfile won't raise
        userprofile = UserProfile.objects.filter(user_id=admin.id).first()
        # Use timezone-aware datetime to avoid comparison errors
        now = timezone.now()
        enrolled_users = EnrolledUser.objects.filter(user=admin, enrolled=True, end_at__gt=now).order_by('-created_at')
        courses = Course.objects.filter(id__in=[e.course_id for e in enrolled_users])

    
    return [courses,userprofile]   




from utils.decorators import api_login_required

@api_login_required
def dashboard(request):
    """
    API endpoint for user dashboard
    Returns JSON response with user profile data and enrolled courses
    Handles different user types: superadmin, staff/TA, and regular users
    Matches Account and UserProfile model fields
    """

    # 🔐 AUTHENTICATION GUARD (FIXED INDENTATION)


    if request.method == 'GET':
        try:
            # Use timezone-aware now to avoid naive/aware datetime errors
            now = datetime.now(timezone.utc)

            # Get user profile and courses based on user type
            courses, userprofile = Admin_verfiy(request.user)
            courses_count = courses.count()

            # Retrieve pending course data from session (from login)
            course_data = request.session.get('course_data', [])

            # Clear the session data after retrieving it
            if 'course_data' in request.session:
                del request.session['course_data']

            # Build user profile response
            if isinstance(userprofile, Account):
                # For superadmin and staff
                user_data = {
                    'id': userprofile.id,
                    'first_name': userprofile.first_name,
                    'last_name': userprofile.last_name,
                    'username': userprofile.username,
                    'email': userprofile.email,
                    'phone_number': userprofile.phone_number,
                    'profession': userprofile.profession,
                    'country': userprofile.country,
                    'is_active': userprofile.is_active,
                    'is_staff': userprofile.is_staff,
                    'is_superadmin': userprofile.is_superadmin,
                    'date_joined': userprofile.date_joined.isoformat(),
                    'user_type': 'superadmin' if userprofile.is_superadmin else 'staff'
                }
            else:
                # For regular users — handle missing UserProfile gracefully
                user_data = {
                    'id': request.user.id,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'username': request.user.username,
                    'email': request.user.email,
                    'phone_number': request.user.phone_number,
                    'profession': request.user.profession,
                    'country': request.user.country,
                    'is_active': request.user.is_active,
                    'is_staff': request.user.is_staff,
                    'is_superadmin': request.user.is_superadmin,
                    'date_joined': request.user.date_joined.isoformat(),
                    'user_type': 'user',
                    'profile': {
                        'address_line_1': userprofile.address_line_1 if userprofile else '',
                        'address_line_2': userprofile.address_line_2 if userprofile else '',
                        'city': userprofile.city if userprofile else '',
                        'state': userprofile.state if userprofile else '',
                        'country': userprofile.country if userprofile else '',
                        'profile_picture': (
                            userprofile.profile_picture.url if (userprofile and userprofile.profile_picture) else None
                        )
                    }
                }

            # Build courses response with progress data
            courses_list = []
            for course in courses:
                # Fetch progress for this course
                progress = OverallProgress.objects.filter(
                    user=request.user,
                    course=course
                ).first()
                
                completion = float(progress.progress) if progress else 0.0
                
                # Fetch enrolled user to get validity and assignments info
                enrolled_user = EnrolledUser.objects.filter(
                    user=request.user,
                    course=course,
                    enrolled=True
                ).first()
                
                # Calculate validity
                if enrolled_user and enrolled_user.end_at:
                    days_remaining = (enrolled_user.end_at - now).days
                    validity = f"{days_remaining} days" if days_remaining > 0 else "Expired"
                else:
                    validity = "N/A"
                
                courses_list.append({
                    'id': course.id,
                    'title': course.title,
                    'category': course.category,
                    'url_link_name': course.url_link_name,
                    'description': course.description[:200]
                    if hasattr(course, 'description') else None,
                    'completion': completion,
                    'validity': validity,
                    'assignments': course.assignments if hasattr(course, 'assignments') else 0
                })

            return JsonResponse({
                'success': True,
                'message': 'Dashboard data retrieved successfully',
                'status': 200,
                'user': user_data,
                'courses': {
                    'total_count': courses_count,
                    'courses_list': courses_list
                },
                'pending_payments': course_data,
                'timestamp': now.isoformat()
            }, status=200)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Failed to retrieve dashboard data: {str(e)}',
                'status': 500
            }, status=500)

    elif request.method in ['POST', 'PUT', 'DELETE']:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a GET request.',
            'status': 405,
            'allowed_methods': ['GET']
        }, status=405)

    else:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed',
            'status': 405
        }, status=405)

@api_login_required
def Payment_due(request):

    # 🔐 Authentication Guard


    # 🔒 Method Guard
    if request.method != "GET":
        return JsonResponse({
            "success": False,
            "message": "Method not allowed. Use GET.",
            "status": 405,
            "allowed_methods": ["GET"]
        }, status=405)

    # Use timezone-aware datetime
    now = timezone.now()

    # ✅ FIX 1: Only fetch NON-EXPIRED enrollments (end_at > now)
    enroll_users = EnrolledUser.objects.filter(
        user=request.user,
        enrolled=True,
        end_at__gt=now
    ).select_related("course").distinct("course")

    response_data = []

    for enroll_user in enroll_users:

        course = enroll_user.course
        
        # ✅ FIX 2: Use foreign_fee for foreign users, indian_fee for Indian users
        user_country = getattr(request.user, 'country', '') or ''
        # Check for both 'india' and 'IN' (country code)
        if user_country.lower() == 'india' or user_country.upper() == 'IN':
            total_fee = Decimal(course.indian_fee or 0)
            currency = '₹'
            currency_code = 'INR'
        else:
            total_fee = Decimal(course.foreign_fee or course.indian_fee or 0)
            currency = '$'
            currency_code = 'USD'
        
        installments = enroll_user.no_of_installments or 1
        per_installment = total_fee / installments if installments > 0 else total_fee
        
        # Calculate due dates based on course progress (33% and 66% completion)
        course_duration = course.duration or 6  # Default to 6 months
        # 2nd payment due at 33% progress = 1/3 of course_duration
        second_installment_due_date = enroll_user.created_at + relativedelta(months=max(1, course_duration//3))
        # 3rd payment due at 66% progress = 2/3 of course_duration
        third_installment_due_date = enroll_user.created_at + relativedelta(months=max(1, (2*course_duration)//3))

        # ✅ FIX 3: Correct logic - if second_installments=False, it's DUE
        second_paid = Decimal(0)
        second_due = Decimal(0)

        if not enroll_user.second_installments:
            second_due = per_installment
        elif enroll_user.second_installments:
            # If flag=True, payment should exist; fetch it safely
            if enroll_user.installment_id_2:
                payment_2nd = Payment.objects.filter(
                    payment_id=enroll_user.installment_id_2
                ).only("amount_paid").first()
                second_paid = Decimal(payment_2nd.amount_paid) if payment_2nd else per_installment
            else:
                # Flag is True but no payment_id: mark as fully paid
                second_paid = per_installment

        # ✅ FIX 4: Correct logic - if third_installments=False, it's DUE
        third_paid = Decimal(0)
        third_due = Decimal(0)

        if installments == 3 and not enroll_user.third_installments:
            third_due = per_installment
        elif installments == 3 and enroll_user.third_installments:
            # If flag=True, payment should exist; fetch it safely
            if enroll_user.installment_id_3:
                payment_3rd = Payment.objects.filter(
                    payment_id=enroll_user.installment_id_3
                ).only("amount_paid").first()
                third_paid = Decimal(payment_3rd.amount_paid) if payment_3rd else per_installment
            else:
                # Flag is True but no payment_id: mark as fully paid
                third_paid = per_installment

        response_data.append({
            "course_id": course.id,
            "course_title": course.title,
            "no_of_installments": installments,
            "currency": currency,
            "currency_code": currency_code,
            "total_fee": float(total_fee),
            "per_installment": float(per_installment),
            "course_duration_months": course_duration,
            "end_at": enroll_user.end_at.isoformat() if enroll_user.end_at else None,
            "second_installment_paid": float(second_paid),
            "second_installment_due": float(second_due),
            "second_installment_due_date": second_installment_due_date.isoformat() if second_due > 0 else None,
            "third_installment_paid": float(third_paid),
            "third_installment_due": float(third_due),
            "third_installment_due_date": third_installment_due_date.isoformat() if third_due > 0 else None,
        })

    return JsonResponse({
        "success": True,
        "message": "Payment due data retrieved successfully",
        "status": 200,
        "data": response_data,
        "timestamp": now.isoformat()
    }, status=200)




@api_login_required
def playlists(request):
    """
    API endpoint for user playlists
    Returns playlists (sections) from enrolled courses
    """


    if request.method != 'GET':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a GET request.',
            'status': 405
        }, status=405)

    enrolled_courses = EnrolledUser.objects.filter(
        user=request.user,
        enrolled=True
    ).values_list('course_id', flat=True)

    playlists_list = []
    playlist_id = 1

    for course_id in enrolled_courses:
        sections = Section.objects.filter(course_id=course_id).order_by('id')
        for section in sections:
            assignments_count = Assignment.objects.filter(section=section).count()
            lectures_count = Video.objects.filter(section=section).count() if hasattr(Video, 'section') else 0
            
            playlists_list.append({
                'id': str(playlist_id),
                'title': section.title or section.name,
                'lectures': max(lectures_count, 1),  # At least 1 to match mock data
                'assignments': max(assignments_count, 1)
            })
            playlist_id += 1

    # If no playlists found, return mock data
    if not playlists_list:
        from .data.loggedInData import loggedInData  # Can't import, so use fallback
        playlists_list = [
            {'id': '1', 'title': 'Getting Started', 'lectures': 10, 'assignments': 2},
            {'id': '2', 'title': 'Advanced Topics', 'lectures': 20, 'assignments': 3},
        ]

    return JsonResponse({
        'success': True,
        'message': 'Playlists retrieved successfully',
        'status': 200,
        'playlists': playlists_list,
        'timestamp': datetime.now().isoformat()
    }, status=200)


@api_login_required
def certificates(request):
    """
    API endpoint for user certificates
    Returns completed courses (completion = 100%) as certificates
    """


    if request.method != 'GET':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a GET request.',
            'status': 405
        }, status=405)

    # Get all courses with 100% completion (certificates)
    completed_courses = OverallProgress.objects.filter(
        user=request.user,
        progress=100
    ).select_related('course')

    certificates_list = []
    for progress in completed_courses:
        course = progress.course
        certificates_list.append({
            'id': str(progress.id),
            'title': course.title,
            'completionDate': progress.created_at.strftime('%d %B %y'),
            'grade': '100%',
            'image': course.course_image.url if course.course_image else '',
        })

    # If no certificates, return empty list
    return JsonResponse({
        'success': True,
        'message': 'Certificates retrieved successfully',
        'status': 200,
        'certificates': certificates_list,
        'timestamp': datetime.now().isoformat()
    }, status=200)



# ==================== NEW JSON VERSION ====================
@csrf_protect
def forgotPassword(request):
    """
    API endpoint for forgot password email
    Returns JSON response confirming if reset email was sent
    Matches Account model field: email
    """
    if request.method == 'POST':
        try:
            import json
            # Handle both JSON and form-data requests
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                email = data.get('email', '').strip()
            else:
                email = request.POST.get('email', '').strip()

            # Validation: Check required field
            if not email:
                return JsonResponse({
                    'success': False,
                    'message': 'Email is required',
                    'status': 400
                }, status=400)

            # Check if account with this email exists
            if Account.objects.filter(email=email).exists():
                user = Account.objects.get(email__exact=email)

                # Generate password reset token
                current_site = get_current_site(request)
                mail_subject = 'Reset Your Password'
                email_context = {
                    'user': user,
                    'domain': current_site,
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': default_token_generator.make_token(user),
                }

                # Send password reset email
                plain_message = render_to_string('accounts/reset_password_email.txt', email_context)
                html_message = render_to_string('accounts/reset_password_email.html', email_context)
                to_email = email
                from_email = settings.EMAIL_HOST_USER
                send_mail(mail_subject, plain_message, from_email, [to_email], html_message=html_message)

                # Return success response
                return JsonResponse({
                    'success': True,
                    'message': 'Password reset email has been sent to your email address. Please check your inbox.',
                    'status': 200,
                    'email_sent': True,
                    'email': email  # For confirmation display
                }, status=200)
            else:
                # Account doesn't exist
                return JsonResponse({
                    'success': False,
                    'message': 'Account with this email address does not exist.',
                    'status': 404,
                    'email_found': False
                }, status=404)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Failed to send reset email: {str(e)}',
                'status': 500
            }, status=500)

    elif request.method == 'GET':
        # Return allowed methods info
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a POST request.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)

    else:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed',
            'status': 405
        }, status=405)



# ==================== NEW JSON VERSION ====================
def resetpassword_validate(request, uidb64, token):
    """
    API endpoint to validate password reset link
    Returns JSON response confirming if reset token is valid
    Takes URL parameters: uidb64 (user id encoded), token (reset token)
    """
    try:
        # Decode the user ID from the base64 encoded string
        uid = urlsafe_base64_decode(uidb64).decode()
        user = Account._default_manager.get(pk=uid)
    except(TypeError, ValueError, OverflowError, Account.DoesNotExist) as e:
        # Invalid or expired reset link
        return JsonResponse({
            'success': False,
            'message': 'Invalid or expired password reset link',
            'status': 400,
            'error_type': 'invalid_link'
        }, status=400)

    # Verify the token is valid
    if user is not None and default_token_generator.check_token(user, token):
        # Token is valid, store in session for next step
        request.session['uid'] = uid
        
        return JsonResponse({
            'success': True,
            'message': 'Password reset link is valid. You can now reset your password.',
            'status': 200,
            'token_valid': True,
            'uid': uid,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=200)
    else:
        # Token is invalid or expired
        return JsonResponse({
            'success': False,
            'message': 'This password reset link has expired or is invalid. Please request a new one.',
            'status': 401,
            'error_type': 'expired_token'
        }, status=401)


@csrf_protect
def resetPassword(request):
    """
    API endpoint to reset user password
    Returns JSON response confirming password reset
    Matches Account model field: password
    Expects: password, confirm_password
    """
    if request.method == 'POST':
        try:
            import json
            # Handle both JSON and form-data requests
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                password = data.get('password', '').strip()
                confirm_password = data.get('confirm_password', '').strip()
                uid = data.get('uid', '').strip()
            else:
                password = request.POST.get('password', '').strip()
                confirm_password = request.POST.get('confirm_password', '').strip()
                uid = request.session.get('uid', '')

            # Validation: Check required fields
            if not password or not confirm_password:
                return JsonResponse({
                    'success': False,
                    'message': 'Password and confirm password are required',
                    'status': 400
                }, status=400)

            # Validation: Passwords match
            if password != confirm_password:
                return JsonResponse({
                    'success': False,
                    'message': 'Passwords do not match',
                    'status': 400
                }, status=400)

            # Validation: Password length (minimum 6 characters)
            if len(password) < 6:
                return JsonResponse({
                    'success': False,
                    'message': 'Password must be at least 6 characters long',
                    'status': 400
                }, status=400)

            # Get uid from session or request
            if not uid:
                uid = request.session.get('uid', '')

            if not uid:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid session. Please request a new password reset link.',
                    'status': 401
                }, status=401)

            # Get user and update password
            try:
                user = Account.objects.get(pk=uid)
            except Account.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User not found',
                    'status': 404
                }, status=404)

            # Set new password
            user.set_password(password)
            user.save()

            # Clear session uid after successful reset
            if 'uid' in request.session:
                del request.session['uid']

            return JsonResponse({
                'success': True,
                'message': 'Password has been reset successfully. You can now login with your new password.',
                'status': 200,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=200)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Password reset failed: {str(e)}',
                'status': 500
            }, status=500)

    elif request.method == 'GET':
        # Return allowed methods info
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a POST request.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)

    else:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed',
            'status': 405
        }, status=405)
# ==================== END OF NEW JSON VERSION ====================

    # old code 
# def Admin_courses(admin):
#     if admin.is_superadmin:
#         print("khilesh here is superadmin")
#         courses=Course.objects.all()
#     elif admin.is_staff and not admin.is_superadmin:
#         print("khilesh here is admin")
#         ta_admin=TeachingAssistant.objects.filter(email=admin.email)
#         courses=ta_admin[0].course_set.all()
#     else:
#         print("khilesh here is user")
#         now = timezone.now()
        enrolled_user=EnrolledUser.objects.filter(user=admin, enrolled=True, end_at__gt=now).order_by('-created_at')
#         courses=Course.objects.filter(id__in=[e.course_id for e in enrolled_user])
#     # print(courses)
#     return courses


    # New Code written by khilesh (Date - 31_Dec_2024) 
def Admin_courses(admin):
    if admin.is_superadmin:
        courses=Course.objects.all()
    elif admin.is_staff and not admin.is_superadmin:
        ta_admin=TeachingAssistant.objects.filter(email=admin.email)
        courses=ta_admin[0].course_set.all()
    else:
        now = timezone.now()
        enrolled_user=EnrolledUser.objects.filter(user=admin, enrolled=True, end_at__gt=now).order_by('-created_at')
        courses=Course.objects.filter(id__in=[e.course_id for e in enrolled_user])
    # print(courses)
    return courses
    
    



# ==================== NEW JSON VERSION ====================
@api_login_required
def mycourses(request):
    """
    API endpoint for listing user's courses
    Returns JSON response with user's enrolled courses based on user type
    Handles different user types: superadmin, staff/TA, and regular users
    Matches Course model fields
    
    Now returns prices based on user's country:
    - Indian users (country='India' or 'IN'): Shows INR prices (₹)
    - Other users: Shows USD prices ($)
    """
    # 🔐 AUTHENTICATION GUARD (API-SAFE)

    
    if request.method == 'GET':
        try:
            # Use timezone-aware datetime to avoid comparison errors with end_at field
            now = timezone.now()
            
            # Get courses based on user type
            courses = Admin_courses(request.user)
            courses_count = courses.count()
            
            # Determine user country for currency selection
            user_country = getattr(request.user, 'country', '') or ''
            is_indian_user = user_country.lower() == 'india' or user_country.upper() == 'IN'
            
            # Build courses response with country-based pricing
            courses_list = []
            for course in courses:
                # Set price and currency based on user's country
                if is_indian_user:
                    course_price = float(course.indian_fee or 0)
                    course_currency = '₹'
                    course_currency_code = 'INR'
                else:
                    course_price = float(course.foreign_fee or course.indian_fee or 0)
                    course_currency = '$'
                    course_currency_code = 'USD'
                
                course_data = {
                    'id': course.id,
                    'title': course.title,
                    'category': course.category,
                    'url_link_name': course.url_link_name,
                    'description': course.description if hasattr(course, 'description') else None,
                    # Country-based pricing fields
                    'price': course_price,
                    'currency': course_currency,
                    'currency_code': course_currency_code,
                    'original_indian_fee': float(course.indian_fee or 0) if hasattr(course, 'indian_fee') else None,
                    'original_foreign_fee': float(course.foreign_fee or 0) if hasattr(course, 'foreign_fee') else None,
                }
                
                # Add additional fields if they exist in the model
                # if hasattr(course, 'price'):
                #     course_data['price'] = course.price
# Add additional fields if they exist in the model
                # if hasattr(course, 'price') and course.price is not None:
                #     course_data['price'] = float(course.price)

                if hasattr(course, 'duration'):
                    course_data['duration'] = course.duration
                if hasattr(course, 'instructor'):
                    course_data['instructor'] = course.instructor.first_name if hasattr(course, 'instructor') else None
                if hasattr(course, 'created_at'):
                    course_data['created_at'] = course.created_at.isoformat()
                if hasattr(course, 'updated_at'):
                    course_data['updated_at'] = course.updated_at.isoformat()
                if hasattr(course, 'is_active'):
                    course_data['is_active'] = course.is_active
                if hasattr(course, 'thumbnail'):
                    course_data['thumbnail'] = course.thumbnail.url if course.thumbnail else None
                
                courses_list.append(course_data)
            
            # Determine user type
            user_type = 'user'
            if request.user.is_superadmin:
                user_type = 'superadmin'
            elif request.user.is_staff:
                user_type = 'staff'
            
            return JsonResponse({
                'success': True,
                'message': 'Courses retrieved successfully',
                'status': 200,
                'user_type': user_type,
                'user_country': user_country or 'Not set',
                'pricing_mode': 'INR' if is_indian_user else 'USD',
                'courses': {
                    'total_count': courses_count,
                    'courses_list': courses_list
                },
                'timestamp': datetime.now().isoformat()
            }, status=200)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Failed to retrieve courses: {str(e)}',
                'status': 500
            }, status=500)

    elif request.method in ['POST', 'PUT', 'DELETE']:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a GET request.',
            'status': 405,
            'allowed_methods': ['GET']
        }, status=405)

    else:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed',
            'status': 405
        }, status=405)
# ==================== END OF NEW JSON VERSION ====================
  

@api_login_required
def profile(request):
    """
    API endpoint to fetch logged-in user's profile
    GET only
    Combines Account + UserProfile models
    """

    if request.method != 'GET':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed',
            'status': 405,
            'allowed_methods': ['GET']
        }, status=405)

    user = request.user
    userprofile = get_object_or_404(UserProfile, user=user)

    profile_data = {
        # Account fields
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'name': f"{user.first_name} {user.last_name}",
        'username': user.username,
        'email': user.email,
        'phone': user.phone_number,
        'profession': user.profession,
        'country': user.country,
        'is_active': user.is_active,
        'created_at': user.date_joined.isoformat(),

        # UserProfile fields
        'address': {
            'address_line_1': userprofile.address_line_1,
            'address_line_2': userprofile.address_line_2,
            'city': userprofile.city,
            'state': userprofile.state,
            'country': userprofile.country,
        },
        'profile_picture': (
            userprofile.profile_picture.url
            if userprofile.profile_picture
            else None
        )
    }

    return JsonResponse({
        'success': True,
        'status': 200,
        'data': profile_data
    }, status=200)


























# @login_required(login_url='login')
# ==================== OLD HTML VERSION (COMMENTED OUT) ====================
# @login_required(login_url='login')
# def edit_profile(request):
#     userprofile = get_object_or_404(UserProfile, user=request.user)
#     if request.method == 'POST':
#         user_form = UserForm(request.POST, instance=request.user)
#         profile_form = UserProfileForm(request.POST, request.FILES, instance=userprofile)
#         if user_form.is_valid() and profile_form.is_valid():
#             user_form.save()
#             profile_form.save()
#             messages.success(request, 'Your profile has been updated.')
#             return redirect('edit_profile')
#     else:
#         user_form = UserForm(instance=request.user)
#         profile_form = UserProfileForm(instance=userprofile)
#     context = {
#         'user_form': user_form,
#         'profile_form': profile_form,
#         'userprofile': userprofile,
#         'title' : 'Edit Profile | Deep Eigen',
#         'canonical_url' : request.build_absolute_uri(request.path)
#     }
#     return render(request, 'accounts/edit_profile.html', context)
# ==================== END OF OLD HTML VERSION ====================







# ==================== NEW JSON VERSION ====================
# @login_required(login_url='login')
# def edit_profile(request):
#     """
#     API endpoint for viewing and updating user profile
#     GET: Returns current user profile data (Account + UserProfile)
#     POST: Updates user profile and returns updated data
#     Matches Account and UserProfile model fields
#     """
#     # 🔐 AUTHENTICATION GUARD (API-SAFE)
#     if not request.user.is_authenticated:
#         return JsonResponse({
#             'success': False,
#             'message': 'Authentication required',
#             'status': 403
#         }, status=403)
    

#     try:
#         userprofile = get_object_or_404(UserProfile, user=request.user)
        
#         if request.method == 'GET':
#             # Return current profile data
#             profile_data = {
#                 'user': {
#                     'id': request.user.id,
#                     'first_name': request.user.first_name,
#                     'last_name': request.user.last_name,
#                     'username': request.user.username,
#                     'email': request.user.email,
#                     'phone_number': request.user.phone_number,
#                     'profession': request.user.profession,
#                     'country': request.user.country,
#                 },
#                 'profile': {
#                     'address_line_1': userprofile.address_line_1,
#                     'address_line_2': userprofile.address_line_2,
#                     'city': userprofile.city,
#                     'state': userprofile.state,
#                     'country': userprofile.country,
#                     'profile_picture': userprofile.profile_picture.url if userprofile.profile_picture else None
#                 }
#             }
            
#             return JsonResponse({
#                 'success': True,
#                 'message': 'Profile data retrieved successfully',
#                 'status': 200,
#                 'data': profile_data
#             }, status=200)

#         elif request.method == 'POST':
#             # Update profile data
#             try:
#                 import json
                
#                 # Handle JSON request
#                 if request.content_type == 'application/json':
#                     data = json.loads(request.body)
                    
#                     # Update Account fields
#                     if 'first_name' in data and data['first_name']:
#                         request.user.first_name = data['first_name'].strip()
#                     if 'last_name' in data and data['last_name']:
#                         request.user.last_name = data['last_name'].strip()
#                     if 'phone_number' in data and data['phone_number']:
#                         request.user.phone_number = data['phone_number'].strip()
#                     if 'profession' in data and data['profession']:
#                         request.user.profession = data['profession'].strip()
#                     if 'country' in data and data['country']:
#                         request.user.country = data['country'].strip()
                    
#                     # Save Account changes
#                     request.user.save()
                    
#                     # Update UserProfile fields
#                     if 'address_line_1' in data:
#                         userprofile.address_line_1 = data['address_line_1'].strip() if data['address_line_1'] else ''
#                     if 'address_line_2' in data:
#                         userprofile.address_line_2 = data['address_line_2'].strip() if data['address_line_2'] else ''
#                     if 'city' in data:
#                         userprofile.city = data['city'].strip() if data['city'] else ''
#                     if 'state' in data:
#                         userprofile.state = data['state'].strip() if data['state'] else ''
#                     if 'country' in data:
#                         userprofile.country = data['country'].strip() if data['country'] else ''
                    
#                     userprofile.save()
                
#                 else:
#                     # Handle form-data request
#                     if request.POST.get('first_name'):
#                         request.user.first_name = request.POST.get('first_name').strip()
#                     if request.POST.get('last_name'):
#                         request.user.last_name = request.POST.get('last_name').strip()
#                     if request.POST.get('phone_number'):
#                         request.user.phone_number = request.POST.get('phone_number').strip()
#                     if request.POST.get('profession'):
#                         request.user.profession = request.POST.get('profession').strip()
#                     if request.POST.get('country'):
#                         request.user.country = request.POST.get('country').strip()
                    
#                     request.user.save()
                    
#                     if request.POST.get('address_line_1'):
#                         userprofile.address_line_1 = request.POST.get('address_line_1').strip()
#                     if request.POST.get('address_line_2'):
#                         userprofile.address_line_2 = request.POST.get('address_line_2').strip()
#                     if request.POST.get('city'):
#                         userprofile.city = request.POST.get('city').strip()
#                     if request.POST.get('state'):
#                         userprofile.state = request.POST.get('state').strip()
#                     if request.POST.get('country'):
#                         userprofile.country = request.POST.get('country').strip()
                    
#                     # Handle profile picture upload
#                     if 'profile_picture' in request.FILES:
#                         userprofile.profile_picture = request.FILES['profile_picture']
                    
#                     userprofile.save()
                
#                 # Return updated profile
#                 updated_profile = {
#                     'user': {
#                         'id': request.user.id,
#                         'first_name': request.user.first_name,
#                         'last_name': request.user.last_name,
#                         'username': request.user.username,
#                         'email': request.user.email,
#                         'phone_number': request.user.phone_number,
#                         'profession': request.user.profession,
#                         'country': request.user.country,
#                     },
#                     'profile': {
#                         'address_line_1': userprofile.address_line_1,
#                         'address_line_2': userprofile.address_line_2,
#                         'city': userprofile.city,
#                         'state': userprofile.state,
#                         'country': userprofile.country,
#                         'profile_picture': userprofile.profile_picture.url if userprofile.profile_picture else None
#                     }
#                 }
                
#                 return JsonResponse({
#                     'success': True,
#                     'message': 'Profile updated successfully',
#                     'status': 200,
#                     'data': updated_profile
#                 }, status=200)

#             except Exception as e:
#                 return JsonResponse({
#                     'success': False,
#                     'message': f'Failed to update profile: {str(e)}',
#                     'status': 400
#                 }, status=400)

#         else:
#             return JsonResponse({
#                 'success': False,
#                 'message': 'Method not allowed. Use GET or POST.',
#                 'status': 405,
#                 'allowed_methods': ['GET', 'POST']
#             }, status=405)

#     except Exception as e:
#         return JsonResponse({
#             'success': False,
#             'message': f'Profile error: {str(e)}',
#             'status': 500
#         }, status=500)

# def edit_profile(request):
    """
    API endpoint for updating user profile
    POST only
    Updates Account + UserProfile fields


    """

    print("RAW BODY:", request.body)
    try:
        data = Json.loads(request.body)
        print("PARSED DATA:", data)
    except Exception as e:
        print("JSON ERROR:", e)
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
    print("METHOD:", request.method)
    print("RAW BODY:", request.body)

    try:
        data = json.loads(request.body)
        print("PARSED DATA:", data)
    except Exception as e:
        print("JSON ERROR:", e)
        return JsonResponse(
            {"success": False, "message": "Invalid JSON"},
            status=400
        )

    # TEMP: return early to confirm JSON works
    return JsonResponse(
        {"success": True, "message": "JSON received"},
        status=200
    )
    # 🔐 AUTHENTICATION GUARD
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required',
            'status': 403
        }, status=403)

    # ❌ Block all methods except POST
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Use POST.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)

    try:
        userprofile = get_object_or_404(UserProfile, user=request.user)

        # -------------------------------
        # JSON REQUEST
        # -------------------------------
        if request.content_type == 'application/json':
            data = json.loads(request.body)

            # 🔹 Update Account fields
            if data.get('first_name'):
                request.user.first_name = data['first_name'].strip()

            if data.get('last_name'):
                request.user.last_name = data['last_name'].strip()

            if data.get('phone_number'):
                request.user.phone_number = data['phone_number'].strip()

            if data.get('profession'):
                request.user.profession = data['profession'].strip()

            if data.get('country'):
                request.user.country = data['country'].strip()

            request.user.save()

            # 🔹 Update UserProfile fields
            userprofile.address_line_1 = data.get('address_line_1', userprofile.address_line_1)
            userprofile.address_line_2 = data.get('address_line_2', userprofile.address_line_2)
            userprofile.city = data.get('city', userprofile.city)
            userprofile.state = data.get('state', userprofile.state)
            userprofile.country = data.get('country', userprofile.country)

            userprofile.save()

        # -------------------------------
        # FORM-DATA REQUEST
        # -------------------------------
        else:
            request.user.first_name = request.POST.get('first_name', request.user.first_name)
            request.user.last_name = request.POST.get('last_name', request.user.last_name)
            request.user.phone_number = request.POST.get('phone_number', request.user.phone_number)
            request.user.profession = request.POST.get('profession', request.user.profession)
            request.user.country = request.POST.get('country', request.user.country)
            request.user.save()

            userprofile.address_line_1 = request.POST.get('address_line_1', userprofile.address_line_1)
            userprofile.address_line_2 = request.POST.get('address_line_2', userprofile.address_line_2)
            userprofile.city = request.POST.get('city', userprofile.city)
            userprofile.state = request.POST.get('state', userprofile.state)
            userprofile.country = request.POST.get('country', userprofile.country)

            if 'profile_picture' in request.FILES:
                userprofile.profile_picture = request.FILES['profile_picture']

            userprofile.save()

        # ✅ RESPONSE
        return JsonResponse({
            'success': True,
            'message': 'Profile updated successfully',
            'status': 200,
            'data': {
                'user': {
                    'id': request.user.id,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'username': request.user.username,
                    'email': request.user.email,
                    'phone_number': request.user.phone_number,
                    'profession': request.user.profession,
                    'country': request.user.country,
                },
                'profile': {
                    'address_line_1': userprofile.address_line_1,
                    'address_line_2': userprofile.address_line_2,
                    'city': userprofile.city,
                    'state': userprofile.state,
                    'country': userprofile.country,
                    'profile_picture': userprofile.profile_picture.url if userprofile.profile_picture else None
                }
            }
        }, status=200)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Failed to update profile: {str(e)}',
            'status': 400
        }, status=400)


# @require_POST
@api_login_required
@csrf_protect
def edit_profile(request):
    """
    API endpoint for updating user profile
    POST only
    Updates Account + UserProfile fields
    """
    # 🔐 AUTHENTICATION GUARD
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required',
            'status': 403
        }, status=403)

    # ❌ Block all methods except POST
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Use POST.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)

    # ---- Parse JSON safely ----
    try:
        import json
        data = json.loads(request.body.decode("utf-8"))
    except Exception as e:
        print("JSON ERROR:", e)
        return JsonResponse(
            {"success": False, "message": "Invalid JSON"},
            status=400
        )

    print("PARSED DATA:", data)

    try:
        user = request.user
        userprofile = get_object_or_404(UserProfile, user=user)

        # ---- Update User fields ----
        if "first_name" in data:
            user.first_name = data["first_name"].strip()

        if "last_name" in data:
            user.last_name = data["last_name"].strip()

        if "phone_number" in data:
            user.phone_number = data["phone_number"].strip()

        if "profession" in data:
            user.profession = data["profession"].strip()

        if "country" in data:
            user.country = data["country"].strip()

        user.save()

        # ---- Update Profile fields ----
        userprofile.address_line_1 = data.get("address_line_1", userprofile.address_line_1)
        userprofile.address_line_2 = data.get("address_line_2", userprofile.address_line_2)
        userprofile.city = data.get("city", userprofile.city)
        userprofile.state = data.get("state", userprofile.state)
        userprofile.country = data.get("country", userprofile.country)

        userprofile.save()

        return JsonResponse({
            "success": True,
            "message": "Profile updated successfully",
            "data": {
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "profession": user.profession,
                    "country": user.country,
                },
                "profile": {
                    "address_line_1": userprofile.address_line_1,
                    "address_line_2": userprofile.address_line_2,
                    "city": userprofile.city,
                    "state": userprofile.state,
                    "country": userprofile.country,
                    "profile_picture": (
                        userprofile.profile_picture.url
                        if userprofile.profile_picture else None
                    ),
                },
            }
        }, status=200)

    except Exception as e:
        print("UPDATE ERROR:", e)
        return JsonResponse({
            "success": False,
            "message": f"Failed to update profile: {str(e)}",
        }, status=400)


@api_login_required
@csrf_protect
def upload_profile_picture(request):
    """
    API endpoint for uploading user profile picture
    POST only with multipart/form-data
    """
    # 🔐 AUTHENTICATION GUARD
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required',
            'status': 403
        }, status=403)

    # ❌ Block all methods except POST
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Use POST.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)

    try:
        userprofile = get_object_or_404(UserProfile, user=request.user)

        # Check if file was uploaded
        if 'profile_picture' not in request.FILES:
            return JsonResponse({
                'success': False,
                'message': 'No profile picture uploaded',
                'status': 400
            }, status=400)

        profile_picture = request.FILES['profile_picture']

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if profile_picture.content_type not in allowed_types:
            return JsonResponse({
                'success': False,
                'message': 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
                'status': 400
            }, status=400)

        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if profile_picture.size > max_size:
            return JsonResponse({
                'success': False,
                'message': 'File too large. Maximum size is 5MB.',
                'status': 400
            }, status=400)

        # Delete old profile picture if exists and not default
        if userprofile.profile_picture:
            old_picture = userprofile.profile_picture.path
            if hasattr(userprofile.profile_picture, 'name') and 'default' not in userprofile.profile_picture.name:
                try:
                    import os
                    if os.path.exists(old_picture):
                        os.remove(old_picture)
                except Exception:
                    pass  # Ignore errors deleting old picture

        # Save new profile picture
        userprofile.profile_picture = profile_picture
        userprofile.save()

        return JsonResponse({
            "success": True,
            "message": "Profile picture uploaded successfully",
            "status": 200,
            "data": {
                "profile_picture": userprofile.profile_picture.url if userprofile.profile_picture else None
            }
        }, status=200)

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return JsonResponse({
            "success": False,
            "message": f"Failed to upload profile picture: {str(e)}",
            'status': 500
        }, status=500)


# ==================== END OF NEW JSON VERSION ====================





# ==================== NEW JSON VERSION ====================
@api_login_required
@csrf_protect
def change_password(request):
    """
    API endpoint for changing user password (logged in users)
    Returns JSON response confirming password change
    Requires current password for verification before change
    Matches Account model field: password
    """
    if request.method == 'POST':
        try:
            import json
            
            # Handle both JSON and form-data requests
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                current_password = data.get('current_password', '').strip()
                new_password = data.get('new_password', '').strip()
                confirm_password = data.get('confirm_password', '').strip()
            else:
                current_password = request.POST.get('current_password', '').strip()
                new_password = request.POST.get('new_password', '').strip()
                confirm_password = request.POST.get('confirm_password', '').strip()

            # Validation: Check required fields
            if not current_password or not new_password or not confirm_password:
                return JsonResponse({
                    'success': False,
                    'message': 'Current password, new password, and confirm password are required',
                    'status': 400
                }, status=400)

            # Validation: New passwords match
            if new_password != confirm_password:
                return JsonResponse({
                    'success': False,
                    'message': 'New password and confirm password do not match',
                    'status': 400
                }, status=400)

            # Validation: New password length (minimum 6 characters)
            if len(new_password) < 6:
                return JsonResponse({
                    'success': False,
                    'message': 'New password must be at least 6 characters long',
                    'status': 400
                }, status=400)

            # Validation: Current password is not same as new password
            if current_password == new_password:
                return JsonResponse({
                    'success': False,
                    'message': 'New password cannot be the same as current password',
                    'status': 400
                }, status=400)

            # Get the current user
            user = Account.objects.get(username__exact=request.user.username)

            # Verify current password is correct
            password_valid = user.check_password(current_password)
            if not password_valid:
                return JsonResponse({
                    'success': False,
                    'message': 'Current password is incorrect',
                    'status': 401
                }, status=401)

            # Set new password
            user.set_password(new_password)
            user.save()

            # Return success response
            return JsonResponse({
                'success': True,
                'message': 'Password changed successfully. Please login again with your new password.',
                'status': 200,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'password_changed_at': datetime.now().isoformat()
                },
                'action': 'login_required'  # Frontend should redirect to login
            }, status=200)

        except Account.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'User not found',
                'status': 404
            }, status=404)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Failed to change password: {str(e)}',
                'status': 500
            }, status=500)

    elif request.method == 'GET':
        # Return allowed methods info
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a POST request.',
            'status': 405,
            'allowed_methods': ['POST']
        }, status=405)

    else:
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed',
            'status': 405
        }, status=405)
# ==================== END OF NEW JSON VERSION ====================

# ==================== TEMPORARY DEBUG ENDPOINT ====================
# This is a temporary debug endpoint to diagnose enrollment issues
# Remove this after fixing the enrollment problems
# @login_required(login_url='login')
# def debug_enrollments(request):
    """
    TEMPORARY DEBUG ENDPOINT - TO BE REMOVED AFTER FIXING ISSUES
    
    This endpoint provides detailed debug information about:
    - User account status
    - All EnrolledUser records (including expired ones)
    - All Order records
    - All Payment records
    - Any data inconsistencies
    """
    if request.method != 'GET':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a GET request.',
            'status': 405,
            'allowed_methods': ['GET']
        }, status=405)

    try:
        user = request.user
        now = timezone.now()
        
        debug_info = {
            'user_info': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superadmin': user.is_superadmin,
                'country': user.country,
                'courses_enrolled_count': getattr(user, 'courses_enrolled', 0),
            },
            'current_time': now.isoformat(),
            'timezone_info': {
                'using': 'django.utils.timezone.now',
                'is_aware': True
            },
            'analysis': {}
        }
        
        # 1. CHECK ALL ENROLLED USER RECORDS
        all_enrolled = EnrolledUser.objects.filter(user=user).order_by('-created_at')
        
        enrolled_data = []
        valid_enrolled = []
        expired_enrolled = []
        
        for enroll in all_enrolled:
            is_valid = enroll.enrolled and enroll.end_at > now
            
            enroll_info = {
                'id': enroll.id,
                'course_id': enroll.course.id if enroll.course else None,
                'course_title': str(enroll.course) if enroll.course else 'UNKNOWN',
                'enrolled': enroll.enrolled,
                'end_at': enroll.end_at.isoformat() if enroll.end_at else None,
                'is_valid_now': is_valid,
                'days_remaining': (enroll.end_at - now).days if enroll.end_at and is_valid else None,
                'no_of_installments': enroll.no_of_installments,
                'first_installments': enroll.first_installments,
                'second_installments': enroll.second_installments,
                'third_installments': enroll.third_installments,
                'created_at': enroll.created_at.isoformat() if enroll.created_at else None,
            }
            
            enrolled_data.append(enroll_info)
            
            if is_valid:
                valid_enrolled.append(enroll_info)
            else:
                expired_enrolled.append(enroll_info)
        
        debug_info['enrolled_users'] = {
            'total_count': all_enrolled.count(),
            'valid_count': len(valid_enrolled),
            'expired_or_invalid_count': len(expired_enrolled),
            'valid_enrollments': valid_enrolled,
            'expired_enrollments': expired_enrolled
        }
        
        # 2. CHECK ALL ORDER RECORDS
        orders = Order.objects.filter(user=user).order_by('-created_at')
        
        order_data = []
        completed_orders = []
        pending_orders = []
        
        for order in orders:
            order_info = {
                'id': order.id,
                'order_number': order.order_number,
                'course_id': order.course.id if order.course else None,
                'course_title': str(order.course) if order.course else 'UNKNOWN',
                'total_amount': order.total_amount,
                'is_ordered': order.is_ordered,
                'status': order.status,
                'created_at': order.created_at.isoformat() if order.created_at else None,
            }
            
            order_data.append(order_info)
            
            if order.is_ordered:
                completed_orders.append(order_info)
            else:
                pending_orders.append(order_info)
        
        debug_info['orders'] = {
            'total_count': orders.count(),
            'completed_count': len(completed_orders),
            'pending_count': len(pending_orders),
            'completed_orders': completed_orders,
            'pending_orders': pending_orders
        }
        
        # 3. CHECK ALL PAYMENT RECORDS
        payments = Payment.objects.filter(user=user).order_by('-created_at')
        
        payment_data = []
        completed_payments = []
        
        for payment in payments:
            payment_info = {
                'id': payment.id,
                'payment_id': payment.payment_id,
                'amount_paid': payment.amount_paid,
                'status': payment.status,
                'payment_method': payment.payment_method,
                'created_at': payment.created_at.isoformat() if payment.created_at else None,
            }
            
            payment_data.append(payment_info)
            
            if payment.status == 'Completed':
                completed_payments.append(payment_info)
        
        debug_info['payments'] = {
            'total_count': payments.count(),
            'completed_count': len(completed_payments),
            'completed_payments': completed_payments
        }
        
        # 4. ANALYSIS: FIND MISMATCHES
        issues = []
        
        # Check: Orders without enrollment
        order_course_ids = set(o['course_id'] for o in completed_orders if o['course_id'])
        enrolled_course_ids = set(e['course_id'] for e in valid_enrolled if e['course_id'])
        
        missing_enrollments = order_course_ids - enrolled_course_ids
        if missing_enrollments:
            issues.append({
                'type': 'COMPLETED_ORDERS_WITHOUT_VALID_ENROLLMENT',
                'description': 'Orders exist but no valid enrollment record found',
                'course_ids': list(missing_enrollments),
                'severity': 'HIGH'
            })
        
        # Check: Valid enrollments without orders
        orphaned_enrollments = enrolled_course_ids - order_course_ids
        if orphaned_enrollments:
            issues.append({
                'type': 'VALID_ENROLLMENTS_WITHOUT_ORDERS',
                'description': 'Valid enrollment exists but no order found',
                'course_ids': list(orphaned_enrollments),
                'severity': 'MEDIUM'
            })
        
        # Check: Expired enrollments
        if expired_enrolled:
            issues.append({
                'type': 'EXPIRED_ENROLLMENTS',
                'description': 'Some enrollments have expired',
                'count': len(expired_enrolled),
                'severity': 'LOW'
            })
        
        # Check: User courses_enrolled count mismatch
        actual_count = len(valid_enrolled)
        stored_count = getattr(user, 'courses_enrolled', 0)
        if actual_count != stored_count:
            issues.append({
                'type': 'COUNT_MISMATCH',
                'description': 'User.courses_enrolled does not match actual valid enrollment count',
                'stored_count': stored_count,
                'actual_count': actual_count,
                'severity': 'LOW'
            })
        
        debug_info['analysis'] = {
            'issues_found': len(issues),
            'issues': issues,
            'summary': {
                'total_orders': orders.count(),
                'total_payments': payments.count(),
                'total_enrollments': all_enrolled.count(),
                'valid_enrollments': len(valid_enrolled),
                'user_stored_course_count': stored_count
            }
        }
        
        # 5. WHAT MYCOURSES ENDPOINT WOULD RETURN
        if user.is_superadmin:
            courses_qs = Course.objects.all()
            visible_courses_count = courses_qs.count()
        elif user.is_staff:
            ta_admin = TeachingAssistant.objects.filter(email=user.email)
            if ta_admin.exists():
                courses_qs = ta_admin[0].course_set.all()
                visible_courses_count = courses_qs.count()
            else:
                courses_qs = Course.objects.none()
                visible_courses_count = 0
        else:
            # Regular user - only sees VALID enrollments
            courses_qs = Course.objects.filter(
                id__in=[e['course_id'] for e in valid_enrolled if e['course_id']]
            )
            visible_courses_count = courses_qs.count()
        
        debug_info['mycourses_simulation'] = {
            'user_type': 'superadmin' if user.is_superadmin else ('staff' if user.is_staff else 'regular_user'),
            'courses_visible_to_user': visible_courses_count,
            'note': 'Regular users only see courses with valid (non-expired) enrollments'
        }
        
        # 6. RECOMMENDATIONS
        recommendations = []
        
        if missing_enrollments:
            recommendations.append({
                'issue': 'Missing enrollment records',
                'action': 'Create EnrolledUser records for completed orders',
                'api': '/courses/place_order_mannualy/'
            })
        
        if orphaned_enrollments:
            recommendations.append({
                'issue': 'Orphaned enrollments',
                'action': 'Verify these enrollments are intentional or create orders',
            })
        
        if expired_enrolled:
            recommendations.append({
                'issue': 'Expired enrollments',
                'action': 'Extend end_at date if payments were completed',
            })
        
        debug_info['recommendations'] = recommendations
        
        return JsonResponse({
            'success': True,
            'message': 'Debug enrollment data retrieved successfully',
            'status': 200,
            'debug': debug_info,
            'note': 'This is a temporary debug endpoint. Remove after fixing issues.',
            'timestamp': now.isoformat()
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Debug failed: {str(e)}',
            'status': 500,
            'error_type': type(e).__name__
        }, status=500)

# ==================== END OF TEMPORARY DEBUG ENDPOINT ====================


# ============================================================
# Payment History Endpoint
# ============================================================
# Purpose: Get payment history for a specific course enrollment
# Route: GET /accounts/payment_history/{course_id}/
# Returns: All payments made for that course with details
# Added: 10 Feb 2026
# ============================================================

def generate_invoice_for_payment(payment_id, course_id, order_id, installment_number=None):
    """
    Helper function to generate and send invoice for a completed payment
    Called from payment_verify webhook
    
    Parameters:
    - payment_id: Razorpay payment ID
    - course_id: Course ID
    - order_id: Order ID
    - installment_number: Which installment (1, 2, or 3)
    
    Returns: True if successful, False otherwise
    """
    try:
        from django.template.loader import render_to_string
        from django.core.mail import EmailMessage
        from course.models import Order, Course
        from django.conf import settings
        
        # Get order and payment details
        order = Order.objects.filter(id=order_id).first()
        if not order:
            print(f"⚠️ Order {order_id} not found for invoice generation")
            return False
        
        payment = Payment.objects.filter(payment_id=payment_id).first()
        if not payment:
            print(f"⚠️ Payment {payment_id} not found for invoice generation")
            return False
        
        # Get enrollment for installment info
        enrollment = EnrolledUser.objects.filter(user=order.user, course_id=course_id).first()
        if not enrollment:
            print(f"⚠️ Enrollment not found for invoice generation")
            return False
        
        # Determine installment text
        installment_text = "Payment Received"
        if installment_number:
            if installment_number == 1:
                installment_text = f"First installment paid (1 of {enrollment.no_of_installments})"
            elif installment_number == 2:
                installment_text = f"Second installment paid (2 of {enrollment.no_of_installments})"
            elif installment_number == 3:
                installment_text = f"Final installment paid ({enrollment.no_of_installments} of {enrollment.no_of_installments})"
        
        # Get course
        course = Course.objects.filter(id=course_id).first()
        course_name = course.title if course else "Unknown Course"
        
        # Prepare email
        mail_list = ['sunil.roat@deepeigen.com']
        
        title_heading = "Payment Received" if installment_number and installment_number > 1 else "New User Enrollment"
        top_heading = f"A user has successfully paid for {course_name}." if installment_number and installment_number > 1 else f"A new user has enrolled in {course_name}."
        
        mail_subject = f"Invoice Generated - {course_name} - Payment {installment_number or 1}"
        
        message = render_to_string('invoice/invoice_mail.html', {
            'title_heading': title_heading,
            'top_heading': top_heading,
            'firstname': order.first_name,
            'lastname': order.last_name,
            'course': course_name,
            'orderid': payment_id,
            'installment_info': installment_text
        })
        
        email = EmailMessage(mail_subject, message, settings.EMAIL_HOST_USER, mail_list)
        email.content_subtype = "html"
        email.send()
        
        print(f"✅ Invoice email sent for payment {payment_id} (Installment {installment_number or 1})")
        return True
        
    except Exception as e:
        print(f"⚠️ Error generating invoice for payment {payment_id}: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False



@api_login_required
def payment_history(request, course_id):

    if request.method != 'GET':
        return JsonResponse({"success": False}, status=405)

    try:
        from course.models import Course, EnrolledUser, Payment

        # ---------------- GET COURSE ----------------
        course = Course.objects.filter(id=course_id).first()
        if not course:
            return JsonResponse({"success": False}, status=404)

        # ---------------- GET ENROLLMENT ----------------
        enrollment = EnrolledUser.objects.filter(
            user=request.user,
            course=course,
            enrolled=True
        ).first()

        if not enrollment:
            return JsonResponse({"success": False}, status=403)

        # ---------------- CURRENCY ----------------
        user_country = (getattr(request.user, 'country', '') or '').upper()

        if user_country in ["INDIA", "IN"]:
            currency = "₹"
            currency_code = "INR"
            total_fee = enrollment.course.indian_fee or 0
        else:
            currency = "$"
            currency_code = "USD"
            total_fee = enrollment.course.foreign_fee or enrollment.course.indian_fee or 0

        # ---------------- COLLECT PAYMENTS ----------------
        payments = []

        # 1st installment
        if enrollment.payment and enrollment.payment.status == "Completed":
            payments.append(enrollment.payment)

        # 2nd installment
        if enrollment.installment_id_2:
            p2 = Payment.objects.filter(
                user=request.user,
                payment_id=enrollment.installment_id_2,
                status="Completed"
            ).first()
            if p2:
                payments.append(p2)

        # 3rd installment
        if enrollment.installment_id_3:
            p3 = Payment.objects.filter(
                user=request.user,
                payment_id=enrollment.installment_id_3,
                status="Completed"
            ).first()
            if p3:
                payments.append(p3)

        # ---------------- BUILD RESPONSE ----------------
        payment_list = []
        total_paid = 0

        for idx, payment in enumerate(payments):

            if enrollment.payment and enrollment.payment.id == payment.id:
                installment_num = 1
            elif enrollment.installment_id_2 == payment.payment_id:
                installment_num = 2
            elif enrollment.installment_id_3 == payment.payment_id:
                installment_num = 3
            else:
                installment_num = idx + 1

            payment_amount = float(payment.amount_paid or 0)
            total_paid += payment_amount

            order = enrollment.order
            order_number = order.order_number if order else "None"
            order_id = order.id if order else None

            payment_list.append({
                "invoice_id": idx + 1,
                "order_id": order_id,
                "payment_id": payment.payment_id,
                "payment_method": payment.payment_method or "unknown",
                # "amount_paid": payment_amount,
                "currency": currency,
                "currency_code": currency_code,
                "status": payment.status.lower() if payment.status else "pending",
                # "created_at": payment.created_at.isoformat() if payment.created_at else None,
                "installment_number": installment_num,
                "no_of_installments": enrollment.no_of_installments,
                "download_url": f"/accounts/invoice/{payment.payment_id}/{course_id}/{order_number}/",
                # "amount_paid": payment_amount,
                "amount": payment_amount,
                # "created_at": payment.created_at.isoformat() if payment.created_at else None,
                # "date": payment.created_at.strftime("%Y-%m-%d") if payment.created_at else None,
                "paid_at": payment.created_at.isoformat() if payment.created_at else None
            })
            print("DATE VALUE:", payment.created_at)

        payment_list.sort(key=lambda x: x["installment_number"])

        remaining_due = float(total_fee) - total_paid

        return JsonResponse({
            "success": True,
            "data": {
                "course_id": course_id,
                "course_name": course.title,
                "total_fee": float(total_fee),
                "total_paid": total_paid,
                "remaining_due": max(0, remaining_due),
                "currency": currency,
                "currency_code": currency_code,
                "no_of_installments": enrollment.no_of_installments,
                "payments": payment_list
            }
        })

    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)
    

#added 13 feb 26 vikas
@api_login_required

def recent_watch(request):
    """
    API endpoint for user's most recently watched video OR last accessed course
    Returns the video details with course and section information
    If no video progress, returns the last accessed course from session
    """
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required',
            'status': 403
        }, status=403)

    if request.method != 'GET':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a GET request.',
            'status': 405
        }, status=405)

    recent_progress = UserVideoProgress.objects.filter(
        user=request.user
    ).select_related('video', 'course', 'section').order_by('-created_at').first()

    if recent_progress:
        video = recent_progress.video
        course = recent_progress.course
        section = recent_progress.section

        module = video.module if video else None
        module_name = module.title if module and hasattr(module, 'title') else module.name if module and hasattr(module, 'name') else ''

        recent_watch_data = {
            'id': recent_progress.id,
            'video_id': video.id if video else None,
            'video_title': video.title if video else '',
            'video_link': video.link if video else '',
            'video_duration': video.duration if video else '',
            'course_id': course.id if course else None,
            'course_title': course.title if course else '',
            'course_url': course.url_link_name if course else '',
            'section_id': section.id if section else None,
            'section_title': section.title if section else section.name if section else '',
            'section_url': section.url_name if section else '',
            'module_name': module_name,
            'completed': recent_progress.completed,
            'watched_at': recent_progress.created_at.isoformat() if recent_progress.created_at else None,
        }

        return JsonResponse({
            'success': True,
            'message': 'Recent watch data retrieved successfully',
            'status': 200,
            'recent_watch': recent_watch_data,
            'timestamp': datetime.now().isoformat()
        }, status=200)

    last_accessed_course_id = request.session.get('last_accessed_course_id')
    last_accessed_course_title = request.session.get('last_accessed_course_title')
    last_accessed_course_url = request.session.get('last_accessed_course_url')
    last_accessed_at = request.session.get('last_accessed_at')

    if last_accessed_course_id:
        recent_watch_data = {
            'id': None,
            'video_id': None,
            'video_title': None,
            'video_link': None,
            'video_duration': None,
            'course_id': last_accessed_course_id,
            'course_title': last_accessed_course_title,
            'course_url': last_accessed_course_url,
            'section_id': None,
            'section_title': None,
            'section_url': 'overview',
            'module_name': None,
            'completed': False,
            'watched_at': last_accessed_at,
        }

        return JsonResponse({
            'success': True,
            'message': 'Last accessed course retrieved from session',
            'status': 200,
            'recent_watch': recent_watch_data,
            'timestamp': datetime.now().isoformat()
        }, status=200)

    return JsonResponse({
        'success': True,
        'message': 'No recent watch history found',
        'status': 200,
        'recent_watch': None,
        'timestamp': datetime.now().isoformat()
    }, status=200)





#added 13 feb vikas
@csrf_protect
def track_last_accessed_course(request):
    """
    API endpoint to track the last accessed course
    When user visits a course, this saves the course as last accessed course
    """
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required',
            'status': 403
        }, status=403)

    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Method not allowed. Please send a POST request.',
            'status': 405
        }, status=405)

    try:
        import json
        data = json.loads(request.body)
        
        course_id = data.get('course_id')
        
        if not course_id:
            return JsonResponse({
                'success': False,
                'message': 'course_id is required',
                'status': 400
            }, status=400)
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Course not found',
                'status': 404
            }, status=404)
        
        request.session['last_accessed_course_id'] = course_id
        request.session['last_accessed_course_title'] = course.title
        request.session['last_accessed_course_url'] = course.url_link_name
        request.session['last_accessed_at'] = datetime.now().isoformat()
        
        return JsonResponse({
            'success': True,
            'message': 'Last accessed course updated',
            'status': 200,
            'data': {
                'course_id': course.id,
                'course_title': course.title,
                'course_url': course.url_link_name,
            },
            'timestamp': datetime.now().isoformat()
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data',
            'status': 400
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error tracking course: {str(e)}',
            'status': 500
        }, status=500)

@api_login_required
def Invoice_section(request):

    enrollments = EnrolledUser.objects.filter(
        user=request.user,
        enrolled=True
    ).select_related("course", "payment")

    data = []

    user_country = (getattr(request.user, "country", "") or "").upper()
    is_indian = user_country in ["INDIA", "IN"]

    currency = "₹" if is_indian else "$"
    currency_code = "INR" if is_indian else "USD"

    for enroll in enrollments:

        payment_ids = []

        if enroll.payment:
            payment_ids.append(enroll.payment.payment_id)

        if enroll.installment_id_2:
            payment_ids.append(enroll.installment_id_2)

        if enroll.installment_id_3:
            payment_ids.append(enroll.installment_id_3)

        payments = Payment.objects.filter(
            payment_id__in=payment_ids,
            status="Completed"
        ).order_by("-created_at")

        for payment in payments:

            if enroll.payment and enroll.payment.payment_id == payment.payment_id:
                installment_number = 1
            elif enroll.installment_id_2 == payment.payment_id:
                installment_number = 2
            elif enroll.installment_id_3 == payment.payment_id:
                installment_number = 3
            else:
                installment_number = 1

            data.append({
                "invoice_id": payment.id,
                "payment_id": payment.payment_id,
                "course_id": enroll.course.id,
                "date": payment.created_at.isoformat(),
                "created_at": payment.created_at.isoformat(),
                "end_at": enroll.end_at.isoformat() if getattr(enroll, 'end_at', None) else None,
                # "amount": float(payment.amount_paid),
                "amount_paid": float(payment.amount_paid or 0),
                "status": "paid",
                "download_url": f"/accounts/invoice/{payment.payment_id}/{enroll.course.id}/None/",
                "currency": currency,
                "currency_code": currency_code,
                "installment_number": installment_number,
                "no_of_installments": enroll.no_of_installments,
                "course": enroll.course.title,
            })

    return JsonResponse({
        "success": True,
        "data": data
    })


@api_login_required
def Invoice(request, payment_id, course_id, orderNumber):

    if not request.user.is_authenticated:
        return JsonResponse({"success": False}, status=403)

    # Get enrollment
    enrollment = EnrolledUser.objects.filter(
        user=request.user,
        course_id=course_id,
        enrolled=True
    ).first()

    if not enrollment:
        return JsonResponse({"success": False, "message": "Enrollment not found"}, status=404)

    # Get payment
    payment = Payment.objects.filter(
        user=request.user,
        payment_id=payment_id,
        status="Completed"
    ).first()

    if not payment:
        return JsonResponse({"success": False, "message": "Payment not found"}, status=404)

    # Detect installment number
    if enrollment.payment and enrollment.payment.payment_id == payment.payment_id:
        installment_number = 1
    elif enrollment.installment_id_2 == payment.payment_id:
        installment_number = 2
    elif enrollment.installment_id_3 == payment.payment_id:
        installment_number = 3
    else:
        installment_number = 1

    # Get order
    # ✅ FIX: Find the CORRECT order based on which payment this is
    # First try to find the order linked to this specific payment
    order = Order.objects.filter(
        payment__payment_id=payment_id,
        user=request.user
    ).first()
    
    if not order:
        # Fallback to enrollment order (first payment / original order)
        order = enrollment.order

    # ✅ HYBRID APPROACH: Check for stored PDF first
    invoice_reg = Invoice_Registrant.objects.filter(
        name=enrollment,
        order=order
    ).first()
    
    if invoice_reg and invoice_reg.invoice:
        # Serve stored PDF (fast, static, consistent)
        try:
            return FileResponse(invoice_reg.invoice.open('rb'), content_type="application/pdf")
        except:
            pass  # Fallback to dynamic generation if file read fails

    # Determine currency
    user_country = (getattr(request.user, "country", "") or "").upper()
    is_indian = user_country in ["INDIA", "IN"]

    currency = "₹" if is_indian else "$"

    # Build PDF dynamically (fallback if no stored file)
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    c.setTitle("INVOICE")

    c.drawString(40, 800, f"Invoice")
    c.drawString(40, 780, f"Payment ID: {payment.payment_id}")
    c.drawString(40, 760, f"Order Number: {order.order_number if order else 'N/A'}")
    c.drawString(40, 740, f"Customer: {request.user.first_name} {request.user.last_name}")
    c.drawString(40, 720, f"Course: {enrollment.course.title}")
    c.drawString(40, 700, f"Installment: {installment_number} of {enrollment.no_of_installments}")
    c.drawString(40, 680, f"Amount Paid: {currency}{payment.amount_paid}")
    c.drawString(40, 660, f"Date: {payment.created_at.date()}")

    c.showPage()
    c.save()

    buffer.seek(0)

    return HttpResponse(buffer, content_type="application/pdf")


def Invoice_manual(request, userId, payment_id, course_id, orderNumber):

    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({"success": False}, status=403)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    user = User.objects.filter(id=userId).first()
    if not user:
        return JsonResponse({"success": False}, status=404)

    enroll = EnrolledUser.objects.filter(
        user=user,
        course=course_id
    ).first()

    if not enroll:
        return JsonResponse({"success": False}, status=404)

    payment = Payment.objects.filter(
        user=user,
        payment_id=payment_id
    ).first()

    if not payment or payment.status != "Completed":
        return JsonResponse({"success": False}, status=400)

    # Call same Invoice logic but impersonate user
    request.user = user
    return Invoice(request, payment_id, course_id, orderNumber)
