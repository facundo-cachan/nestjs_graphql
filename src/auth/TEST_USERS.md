# Usuarios de Prueba - LDAP

## 📋 Usuarios Creados

Se han creado 4 usuarios de prueba en el servidor LDAP con diferentes roles:

### 👤 Usuario 1: Administrador

```
Username: jdoe
Password: password123
Nombre: John Doe
Email: jdoe@organizacion.com
Organización: Agencia Nacional de Seguridad Vial
Título: Administrador de Sistema
Grupos: admins
```

### 👤 Usuario 2: Gerente

```
Username: jsmith
Password: password123
Nombre: Jane Smith
Email: jsmith@organizacion.com
Organización: Agencia Nacional de Seguridad Vial
Título: Gerente de Operaciones
Grupos: managers, operators
```

### 👤 Usuario 3: Operador

```
Username: bjohnson
Password: password123
Nombre: Bob Johnson
Email: bjohnson@organizacion.com
Organización: Agencia Nacional de Seguridad Vial
Título: Operador de Sistema
Grupos: operators
```

### 👤 Usuario 4: Auditora

```
Username: awilliams
Password: password123
Nombre: Alice Williams
Email: awilliams@organizacion.com
Organización: Agencia Nacional de Seguridad Vial
Título: Auditora
Grupos: auditors
```

---

## 🧪 Pruebas de Autenticación

### Test con cURL

```bash
# Login con John Doe (Admin)
curl -X POST http://localhost:3200/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdoe",
    "password": "password123"
  }'

# Login con Jane Smith (Manager)
curl -X POST http://localhost:3200/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jsmith",
    "password": "password123"
  }'
```

**Respuesta esperada**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "jdoe",
    "name": "John Doe",
    "email": "jdoe@organizacion.com"
  }
}
```

### Usar el Token

```bash
# Guardar el token
TOKEN="<tu_access_token_aqui>"

# Hacer petición autenticada
curl http://localhost:3200/persons \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏷️ Grupos Creados

| Grupo | Miembros | Descripción |
|-------|----------|-------------|
| `admins` | jdoe | Administradores del sistema |
| `managers` | jsmith | Gerentes con permisos elevados |
| `operators` | jsmith, bjohnson | Operadores del sistema |
| `auditors` | awilliams | Auditores de seguridad |

---

## 🔍 Verificar Usuarios en LDAP

### Listar todos los usuarios

```bash
docker exec ldap-server ldapsearch \
  -x -D "cn=admin,dc=organizacion,dc=com" \
  -w adminpassword \
  -b "ou=users,dc=organizacion,dc=com" \
  "(objectClass=inetOrgPerson)"
```

### Buscar un usuario específico

```bash
docker exec ldap-server ldapsearch \
  -x -D "cn=admin,dc=organizacion,dc=com" \
  -w adminpassword \
  -b "ou=users,dc=organizacion,dc=com" \
  "(uid=jdoe)"
```

### Listar grupos

```bash
docker exec ldap-server ldapsearch \
  -x -D "cn=admin,dc=organizacion,dc=com" \
  -w adminpassword \
  -b "ou=groups,dc=organizacion,dc=com" \
  "(objectClass=groupOfNames)"
```

---

## 🌐 Interfaz Web (phpLDAPadmin)

Puedes gestionar los usuarios visualmente en:

**URL**: http://localhost:8080

**Credenciales de Login**:
- Login DN: `cn=admin,dc=organizacion,dc=com`
- Password: `adminpassword`

Desde ahí puedes:
- ✅ Ver todos los usuarios y grupos
- ✅ Crear nuevos usuarios
- ✅ Modificar usuarios existentes
- ✅ Cambiar contraseñas
- ✅ Asignar usuarios a grupos

---

## 🔐 Estructura LDAP

```
dc=organizacion,dc=com
├── ou=users
│   ├── uid=jdoe (John Doe - Admin)
│   ├── uid=jsmith (Jane Smith - Manager)
│   ├── uid=bjohnson (Bob Johnson - Operator)
│   └── uid=awilliams (Alice Williams - Auditor)
└── ou=groups
    ├── cn=admins
    ├── cn=managers
    ├── cn=operators
    └── cn=auditors
```

---

## 🛠️ Gestión de Usuarios

### Crear un nuevo usuario

Edita el archivo `test-users.ldif` y agrega:

```ldif
# User 5: Nuevo Usuario
dn: uid=nuevousuario,ou=users,dc=organizacion,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
uid: nuevousuario
cn: Nombre Completo
sn: Apellido
givenName: Nombre
mail: nuevousuario@organizacion.com
userPassword: password123
uidNumber: 10005
gidNumber: 10005
homeDirectory: /home/nuevousuario
loginShell: /bin/bash
o: Agencia Nacional de Seguridad Vial
title: Título del Usuario
```

Luego importa:
```bash
docker cp test-users.ldif ldap-server:/tmp/test-users.ldif
docker exec ldap-server ldapadd -x -D "cn=admin,dc=organizacion,dc=com" -w adminpassword -f /tmp/test-users.ldif
```

### Cambiar contraseña

```bash
docker exec ldap-server ldappasswd \
  -x -D "cn=admin,dc=organizacion,dc=com" \
  -w adminpassword \
  -s nuevapassword123 \
  "uid=jdoe,ou=users,dc=organizacion,dc=com"
```

### Eliminar un usuario

```bash
docker exec ldap-server ldapdelete \
  -x -D "cn=admin,dc=organizacion,dc=com" \
  -w adminpassword \
  "uid=jdoe,ou=users,dc=organizacion,dc=com"
```

---

## ⚠️ Notas Importantes

1. **Contraseñas de prueba**: Todos los usuarios tienen la misma contraseña `password123` por simplicidad. En producción, cada usuario debe tener una contraseña única y segura.

2. **Base DN**: La configuración usa `dc=organizacion,dc=com`. Si la cambias en el docker-compose, debes actualizar también el archivo LDIF.

3. **Persistencia**: Los usuarios creados persisten mientras el contenedor exista. Si haces `docker-compose down -v`, se perderán y deberás importarlos nuevamente.

4. **Producción**: Este setup es solo para desarrollo/testing. En producción deberías:
   - Usar LDAPS (puerto 636)
   - Conectar a un servidor LDAP corporativo real
   - Implementar políticas de contraseñas fuertes
   - Gestionar usuarios a través de tu sistema de recursos humanos

---

**Creado**: 2026-01-09  
**Usuarios**: 4 activos  
**Grupos**: 4 configurados
