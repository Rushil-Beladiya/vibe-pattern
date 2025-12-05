Build a complete DYNAMIC FORM BUILDER application with:

Frontend : React Native (mobile app)
Backend : Laravel
Database : MySQL
Auth or api : Laravel Sanctum

The application must support 3 roles:

1. Super Admin → Dynamic Screen + Form Creator
2. Admin → Form Filler (per screen and form)
3. User → Data Viewer (screen-wise, dynamic bottom tabs)

All configuration (screens, bottom tabs, forms, fields, labels, types) must be DATA-DRIVEN from the backend. The frontend must NOT hardcode any specific screens like "Music", "Vibro", "Profile". Everything should be dynamic based on backend JSON.

==================================================

1. # CORE CONCEPT

- Super Admin defines "Screens" (e.g., Music, Vibro, Profile).
- Each Screen can have one or more Forms (templates).
- Each Form is defined as a JSON schema, including fields (label, key, type, etc).
- Admin selects a Screen → selects a Form → fills and submits data.
- User app bottom tab bar is dynamic: tabs = Screens from backend.
- When User taps on a tab (Screen), app fetches and displays all fields for that Screen (with media support: images, mp3, pdf).

Everything must be dynamic: adding/changing/removing screens/forms/fields by Super Admin must automatically reflect in Admin & User apps via APIs.

# ================================================== 2. DATA MODEL & DATABASE DESIGN

Use MySQL with the following tables (feel free to adjust names but keep behavior):

## TABLE: users

- id (bigint, PK)
- name (string)
- email (string, unique)
- password (string, hashed)
- role (enum: 'super_admin', 'admin', 'user')
- created_at
- updated_at

## TABLE: screens (dynamic app screens / bottom tabs / sidedrawer)

- id (bigint, PK)
- name (string) // Display name in UI, e.g. "Music"
- slug (string, unique) // e.g. "music", used for routing and mapping
- icon (string, nullable) // optional: icon name
- is_active (boolean)
- type (string) // eg. bottom || sidedrawer
- sort_order (int) // for bottom tab order
- created_at
- updated_at

## TABLE: forms (created per screen by Super Admin)

- id (bigint, PK)
- screen_id (foreign key -> screens.id)
- name (string) // e.g. "Music Form"
- fields (json) // full form template/structure
- is_active (boolean)
- created_by (foreign key -> users.id)
- created_at
- updated_at

fields JSON structure explanation:

- Super Admin creates the form template with field definitions
- Admin fills in the form and values are saved in the same fields JSON
- User views the filled data from the fields JSON

fields example for "Music Form" (AFTER Admin fills it):
[
{
"label": "Music Name",
"key": "music_name",
"type": "text",
"value": "Animal Song", // Filled by Admin
"placeholder": "Enter music name",
"required": true
},
{
"label": "Cover Image",
"key": "cover_image",
"type": "image",
"value": "https://domain.com/storage/uploads/music/123_cover.jpg", // Uploaded by Admin
"required": false
},
{
"label": "Music File",
"key": "music_file",
"type": "file",
"value": "https://domain.com/storage/uploads/music/123_animal.mp3", // Uploaded by Admin
"allowed_mimes": ["audio/mpeg", "application/pdf"],
"required": true
},
{
"label": "Category",
"key": "category",
"type": "select",
"value": "Kids Song", // Selected by Admin
"options": ["Animal Song", "Kids Song", "Bhajan", "Pop"],
"required": false
}
]

Rules:

- `key` is generated from label (e.g. "Music Name" → "music_name") and used as JSON property.
- Types allowed: "text", "input" (alias of text), "select", "image", "file", "date", "textarea", "checkbox".
- All field must be valid JSON; no hardcoded form structure in code.
- The "value" field starts empty when Super Admin creates the form
- Admin fills in the "value" field when submitting the form
- User sees the filled "value" field when viewing the form

# ================================================== 3. ROLE LOGIC & PERMISSIONS

Roles:

SUPER ADMIN:

- Manage Screens:
  - Create / Update / Delete screens.
  - Fields: name, slug, icon (optional), is_active, sort_order.
  - These screens are used to build bottom tab bar dynamically in frontend.
- Manage Forms:
  - For each screen, create one or multiple forms.
  - For each form, design fields (fields with label, key, type, value, options, etc).
  - Update forms (modify fields).
  - Delete forms.
- value of each fields can be added by superadmin while generating that field

ADMIN:

- Cannot create or edit screens or forms.
- Can see list of active screens.
- Can see list of forms under each screen.
- Can select a form and submit data:
  - Fill in text/select fields.
  - Upload images.
  - Upload files (mp3, pdf, etc).
- Form saved as value keyed by field keys.

USER:

- Can't edit anything.
- On app start, bottom tab bar is built dynamically based on active screens from backend.
- When User taps a tab (e.g., Music), app:
  - Fetches all relevant data fields for that screen.
  - Displays label/value pairs.
  - For file fields:
    - If image → show image.
    - If mp3 → allow playback via audio player.
    - If pdf → show open/download option or preview (if implemented).
- Data is read-only for users.

# ================================================== 4. LARAVEL BACKEND – API DESIGN

Use Laravel.

---

## AUTH ROUTES

- POST /api/auth/login
- POST /api/auth/logout

Return user, token, and role in login response.

---

## SUPER ADMIN APIs

// All protected by auth + role:super_admin

SCREENS:

1. Create screen

   - POST /api/admin/screens
   - Body:
     {
     "name": "Music",
     "slug": "music",
     "icon": "music-note", // optional
     "type": "botton",
     "sort_order": 1,
     "is_active": true
     }

2. Update screen

   - PUT /api/admin/screens/{id}

3. Delete screen

   - DELETE /api/admin/screens/{id}

4. List all screens
   - GET /api/admin/screens

FORMS:

1. Create form for a screen

   - POST /api/admin/screens/{screen_id}/forms
   - Body:
     {
     "name": "Music Form",
     "fields": { ... } // full JSON schema as above
     }

2. Update form

   - PUT /api/admin/forms/{id}
   - Can update name, fields, is_active.

3. Delete form

   - DELETE /api/admin/forms/{id}

4. List forms by screen

   - GET /api/admin/screens/{screen_id}/forms

---

## ADMIN APIs (FORM FILLING)

// Protected by auth + role:admin

1. Get all active screens

   - GET /api/admin/screens
   - Returns: id, name, slug, icon, type, sort_order.

2. Get all active forms for a screen

   - GET /api/admin/screens/{screen_id}/forms

3. Get form schema to render dynamic form

   - GET /api/admin/forms/{form_id}
   - Returns:
     {
     "id": ...,
     "name": ...,
     "screen": {...},
     "fields": {...}
     }

4. Submit form data

   - POST /api/admin/forms/{form_id}/submit
   - Content-Type: multipart/form-data (because of files/images).
   - Body example:
     - fields: (non-file)
       - music_name: "Animal Song"
       - category: "Kids Song"
     - files:
       - cover_image: image file
       - music_file: .mp3 file
   - Controller logic:
     - Load form and fields.
     - For each field in fields.fields:
       - If type is image or file:
         - Check if file exists in request.
         - Validate mime types (e.g., mp3, jpg, png).
         - Store file using Laravel Storage (e.g., storage/app/public/uploads/...).
         - Save public URL/path as value in fields[key] value.
       - Else:
         - Get input from request.
         - Validate required fields.
         - Save value in fields[key] vale.
   - Response: success + stored data_json.

---

## USER APIs (VIEW DATA)

// Protected by auth + role:user

1. Get active screens (for bottom tab bar)

   - GET /api/user/screens
   - Returns all active screens with id, name, slug, icon, type, sort_order.

2. Get form fields for a specific screen

   - GET /api/user/screens/{screen_slug}/form
   - Behavior:
     - Find screen by slug.
     - Fetch all forms for that screen.

3. Get a single form detail
   - GET /api/user/forms/{id}
   - Response includes form fields so frontend can render label/value.

# ================================================== 5. REACT NATIVE FRONTEND – ARCHITECTURE

Use:

- React Navigation (bottom tabs + sidebar stacks).
- Axios for API calls.
- AsyncStorage for token and theme.
- Context API or Redux for auth + theme.

Core requirement:

- BOTTOM TAB BAR SCREENS MUST BE DYNAMIC based on backend `/user/screens` or `/admin/screens`.

---

## AUTH FLOW

- LoginScreen:
  - Email + password.
  - POST /api/auth/login
  - Save token + role in AsyncStorage/Context.
  - Based on role:
    - role == super_admin → SuperAdminNavigator
    - role == admin → AdminNavigator
    - role == user → UserNavigator

# ================================================== 6. FRONTEND – DYNAMIC BOTTOM TAB BAR FOR ADMIN & USER

ADMIN:

- AdminNavigator:
  - First, fetch `/api/admin/screens`.
  - Build bottom tab navigator dynamically from returned screens.
  - For each screen:
    - Tab name = screen.name
    - Tab key/route = screen.slug
    - Screen component = generic AdminScreen component that:
      - On mount, calls `/api/admin/screens/{screen_id}/forms`.
      - Lists forms for that screen.
      - On selecting a form → navigate to AdminFormFillScreen.

USER:

- UserNavigator:
  - On app start or login, fetch `/api/user/screens`.
  - Build bottom tab navigator dynamically from returned screens.
  - For each screen:
    - Tab name = screen.name
    - Tab route = screen.slug
    - Screen component = generic UserScreen component that:
      - On mount, calls `/api/user/screens/{screen_slug}/forms`.
      - Renders list/grid of fields in a nice card layout.
      - Card shows main fields like title image + text based on schema (e.g. music_name + cover_image).
      - On press, navigate to UserFormsDetail.

# ================================================== 7. FRONTEND – SUPER ADMIN UI (FORM + SCREEN BUILDER)

SUPER ADMIN NAVIGATOR:

Screens:

1. SA_ScreenList:

   - GET /api/admin/screens
   - List all screens with options:
     - Create Screen
     - Edit Screen
     - Delete Screen

2. SA_ScreenForm:

   - For create/edit screen:
     - name
     - slug
     - icon (optional)
     - type
     - sort_order
     - is_active
   - POST/PUT to backend.

3. SA_FormList (per screen):

   - GET /api/admin/screens/{screen_id}/forms
   - Show forms for that screen.
   - Buttons:
     - Create New Form
     - Edit Form
     - Delete Form

4. SA_FormBuilder:
   - Dynamic form schema editor.
   - UI to add fields:
     - label (text)
     - key (auto generated from label; editable if needed)
     - type (select from: text, input, select, image, file, textarea, date)
     - required (toggle)
     - options (array for select)
   - Maintain a local `fields` object.
   - On save:
     - POST/PUT fields to backend.
   - Provide "Preview Form" button which uses the same dynamic renderer as admin but in read-only/preview mode.

# ================================================== 8. FRONTEND – ADMIN FORM FILLING (DYNAMIC RENDERER)

AdminFormFillScreen:

- Receives form_id.
- On mount:
  - GET /api/admin/forms/{form_id} → get fields.
- Use a DynamicFormRenderer component which:
  - For each field in fields.fields:
    - Render appropriate input:
      - type "text"/"input" → TextInput.
      - type "select" → DropDown / Picker.
      - type "image" → Button → open Image Picker → store file reference in state.
      - type "file" → File Picker for mp3/pdf.
      - type "textarea" → multiline TextInput.
      - type "date" → Date picker.
    - Show label from field.label.
  - Maintain state object `formValues` and `fileValues`.

Example state:

- formValues = { music_name: "Animal Song", category: "Kids Song" }
- fileValues = { cover_image: fileObject1, music_file: fileObject2 }

On submit:

- Build multipart/form-data:
  - Append all formValues as normal fields.
  - Append all fileValues as file fields.
- POST to `/api/admin/forms/{form_id}/submit`.
- On success, show message and reset or navigate back.

# ================================================== 9. FRONTEND – USER VIEW (SCREEN-WISE DATA)

UserScreen (generic for each slug/tab):

- Receives screen_slug prop/route.
- On mount:
  - GET `/api/user/screens/{screen_slug}/forms`.
- For each forms:
  - Use card UI:
    - Show primary title (e.g. first text field value like music_name).
    - Show image thumbnail if there is an image field in data_json.
  - On press → navigate to UserformDetailScreen.

UserformDetailScreen:

- GET `/api/user/forms/{id}`.
- Use form.fields.fields to determine label order.
- For each field:
  - Display:
    - Label from field.label.
    - Value from data_json[field.key].
  - If type is "image" → show <Image> from URL.
  - If type is "file" and extension is mp3 → show audio player control.
  - If type is "file" and extension is pdf → show "Open PDF" button (linking to URL).

# ================================================== 10. THEME / COLOR SYSTEM

Implement a ThemeContext with:

- Modes: "light", "dark".
- Theme object includes:
  - colors.background
  - colors.card
  - colors.text
  - colors.primary
  - colors.border
- Add ability to change primary color from Settings screen.
- Save:
  - themeMode
  - primaryColor
    in AsyncStorage so it persists across restarts.

All screens, buttons, text, tab bar, cards should use theme values. When super admin or user changes theme (if allowed), UI updates accordingly.

# ================================================== 11. VALIDATION & SECURITY

Backend:

- Validate all requests (screen, form, fields, file types, required fields).
- Use role-based middleware:
  - super_admin routes only accessible to super_admin users.
  - admin routes only accessible to admin users.
  - user routes only accessible to user users.
- Protect all APIs with auth:api middleware.
- For file uploads:
  - Validate max size.
  - Validate allowed mime types (for type "file", specifically mp3/pdf; for "image" use image mimetypes).
  - Store via Laravel Storage and return public URLs.

Frontend:

- Handle token expiration, 401, 403.
- Validate required fields client-side before submit.

# ================================================== 12. OUTPUT EXPECTATION

Generate:

BACKEND (LARAVEL):

- Migrations:
  - users
  - screens
  - forms
- Models:
  - User (with role)
  - Screen
  - Form
- Seeders for example roles/users.
- Controllers:
  - AuthController
  - SuperAdmin/ScreenController
  - SuperAdmin/FormController
  - User/ScreenController
- API routes in routes/api.php grouped by role.
- Middleware for role-based access.
- File upload handling for image/file fields.
- Response formats matching the data structures above.

FRONTEND (REACT NATIVE):

- Navigation:
  - AuthNavigator
  - SuperAdminNavigator
  - AdminNavigator (dynamic bottom tabs from backend)
  - UserNavigator (dynamic bottom tabs from backend)
- Screens:
  - Auth: Login
  - Super Admin: ScreenList, ScreenForm, FormList, FormBuilder, FormPreview
  - Admin: DynamicTabs (by screen), FormListByScreen, AdminFormFill
  - User: DynamicTabs (by screen), UserScreenListByScreen
  - Settings: Theme & color selection
- Components:
  - DynamicFormRenderer (for admin filling + SA preview)
  - FieldEditor (for super admin schema building)
  - ThemedButton, ThemedInput, ThemedCard
- Context/State:
  - AuthContext (token, user, role)
  - ThemeContext (mode, primaryColor)
- Services:
  - api.js (axios client with token)
  - authService.js
  - screenService.js
  - formService.js

# ================================================== 13. FINAL GOAL

Deliver a fully dynamic, production-ready system where:

- Super Admin dynamically defines screens + forms via backend.
- Admin fills forms screen-wise and fields are saved as JSON key-value pairs with file support.
- User sees a fully dynamic bottom tab bar driven by backend screens, can select each screen and view all submitted data (images, mp3, pdf, text) properly mapped by label and type.

No hardcoded screens, forms, or labels in the app; everything must come from backend JSON.
