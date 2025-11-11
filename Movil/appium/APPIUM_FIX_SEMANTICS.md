# 🎯 Appium Tests - Missing Semantics Labels

## ✅ Estado Actual
- ✅ Appium conecta correctamente con Android 15.0
- ✅ APK se instala y abre en el dispositivo
- ✅ 1 test PASSING (should access chat section)
- ❌ 5 tests FAILING - **Elementos UI no encontrados**

## 🔍 Problema
Appium busca elementos usando `accessibility id` (ej: `~Regístrate`, `~login_email_field`), pero los widgets de Flutter **NO tienen etiquetas Semantics**, por lo que Appium no puede encontrarlos.

## 🛠️ Solución: Agregar Semantics Labels

### Widgets que NECESITAN Semantics:

#### 1. **LoginScreen** (`lib/screens/login_screen.dart`)
```dart
// Línea ~146 - Botón "Regístrate"
Semantics(
  label: 'Regístrate',
  button: true,
  child: TextButton(
    onPressed: () => Navigator.pushNamed(context, '/register'),
    child: const Text('¿No tienes cuenta? Regístrate'),
  ),
)

// Campos de email y password
TextField(
  key: const Key('login_email_field'),
  // Agregar:
  decoration: InputDecoration(
    labelText: 'Email',
    semanticLabel: 'login_email_field', // <-- AGREGAR ESTO
  ),
)

TextField(
  key: const Key('login_password_field'),
  decoration: InputDecoration(
    labelText: 'Contraseña',
    semanticLabel: 'login_password_field', // <-- AGREGAR ESTO
  ),
)

// Botón "Iniciar Sesión"
Semantics(
  label: 'login_submit_button',
  button: true,
  child: ElevatedButton(
    onPressed: _login,
    child: const Text('Iniciar Sesión'),
  ),
)
```

#### 2. **RegisterScreen** (`lib/screens/register_screen.dart`)
```dart
TextField(
  key: const Key('register_name_field'),
  decoration: InputDecoration(
    labelText: 'Nombre',
    semanticLabel: 'register_name_field', // <-- AGREGAR
  ),
)

TextField(
  key: const Key('register_email_field'),
  decoration: InputDecoration(
    labelText: 'Email',
    semanticLabel: 'register_email_field', // <-- AGREGAR
  ),
)

TextField(
  key: const Key('register_password_field'),
  decoration: InputDecoration(
    labelText: 'Contraseña',
    semanticLabel: 'register_password_field', // <-- AGREGAR
  ),
)

TextField(
  key: const Key('register_confirm_password_field'),
  decoration: InputDecoration(
    labelText: 'Confirmar Contraseña',
    semanticLabel: 'register_confirm_password_field', // <-- AGREGAR
  ),
)

// Radio buttons para rol
Semantics(
  label: 'role_user',
  button: true,
  selected: _role == 'user',
  child: Radio<String>(
    value: 'user',
    groupValue: _role,
    onChanged: (value) => setState(() => _role = value),
  ),
)

Semantics(
  label: 'role_caregiver',
  button: true,
  selected: _role == 'caregiver',
  child: Radio<String>(
    value: 'caregiver',
    groupValue: _role,
    onChanged: (value) => setState(() => _role = value),
  ),
)

// Botón "Crear Cuenta"
Semantics(
  label: 'register_submit_button',
  button: true,
  child: ElevatedButton(
    onPressed: _register,
    child: const Text('Crear Cuenta'),
  ),
)
```

#### 3. **MainNavigation** (`lib/screens/main_navigation.dart`)
```dart
// Bottom Navigation Bar items
BottomNavigationBar(
  items: [
    BottomNavigationBarItem(
      icon: Semantics(
        label: 'nav_services',
        child: Icon(Icons.home),
      ),
      label: 'Servicios',
    ),
    BottomNavigationBarItem(
      icon: Semantics(
        label: 'nav_chat',
        child: Icon(Icons.chat),
      ),
      label: 'Chats',
    ),
    // etc...
  ],
)
```

## 📝 Elementos que Appium busca:

```javascript
// LoginScreen
'~Regístrate'                   // TextButton para ir a registro
'~login_email_field'            // Campo de email
'~login_password_field'         // Campo de contraseña
'~login_submit_button'          // Botón "Iniciar Sesión"

// RegisterScreen
'~register_name_field'          // Campo de nombre
'~register_email_field'         // Campo de email
'~register_password_field'      // Campo de contraseña
'~register_confirm_password_field' // Confirmar contraseña
'~role_user'                    // Radio button para usuario
'~role_caregiver'               // Radio button para cuidador
'~register_submit_button'       // Botón "Crear Cuenta"

// MainNavigation
'~nav_services'                 // Tab de servicios
'~nav_chat'                     // Tab de chats
```

## 🚀 Pasos para Implementar:

1. **Abrir archivos** mencionados arriba
2. **Agregar Semantics** a cada widget según ejemplos
3. **Recompilar APK**:
   ```bash
   cd Movil
   flutter build apk --debug
   ```
4. **Ejecutar tests** nuevamente:
   ```bash
   cd appium
   .\run-appium-tests.ps1
   ```

## 📚 Recursos:
- [Flutter Semantics](https://api.flutter.dev/flutter/widgets/Semantics-class.html)
- [Appium Accessibility](https://appium.io/docs/en/writing-running-appium/finding-elements/)

## ✨ Resultado Esperado:
Una vez agregados los Semantics, Appium podrá encontrar todos los elementos y los tests deberían pasar.

---

**Nota**: Los `Key()` que ya existen son para Flutter Integration Tests. Los `Semantics` son para Appium (accesibilidad nativa).
