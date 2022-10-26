# ROUTES

## AUTH ROUTES => **_/api/auth_**

### 1. Signup => **_/signup_** [post]

- Body - email, password, name, role

### 2. Login => **_/login_** [post]

- Body - email, password

### 3. Get User => **_/user_** [get]

- Header - access token

### 4. Update User => **_/update-user_** [post]

- Header - access token
- Body - name position >_all optional_<

### 5. Get user by email => **_/user_** [post]

- Header - access token
- Body - email

### 6. Update user by email => **_/update-user_** [patch]

- Header - access token
- Body - email >_compulsary_<, name role >_optional_<

### 7. Create new class => **_/create-class_** [post]

- Header - access token
- Body - name

### 8. Add Teacher to a class **_/add-teacher_** [post]

- Header - access token
- Body - email, className

### Add Subject(s) to class **_/add-subject_** [post]

- Header - access token
- Body - subjects[], className

### Remove Subject from class **_/remove-subject_** [post]

- Header - access token
- Body - subjects[], className

### Add Student **_/add-student_** [post]

-Header - access token
-Body - name parentEmail

### upload image **_/upload-profile-image_** [post]

-Header - access token
-Body - file
