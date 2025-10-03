# Keycloak 23.0.7 Specific Notes

## Version Compatibility
- **Keycloak Version:** 23.0.7
- **Release Date:** March 2024
- **Java Version:** Requires Java 17+

## UI Changes in 23.0.7

### User Federation
- **Old:** "Add provider" button
- **New:** "Add Ldap providers" dropdown button
- Location: Realm → User Federation

### Mappers Configuration
- **Navigation:** User Federation → [provider-name] → Mappers tab
- **Add Mapper:** Click "Add mapper" button (not "Create")
- **Mapper Types:** Dropdown selection instead of radio buttons

### Groups Management
- **Location:** Left sidebar → Groups (not under User Federation)
- **Role Mapping:** Groups → [group-name] → Role mapping tab
- **Interface:** Updated role assignment interface

### Logging Configuration
- **Location:** Realm Settings → Logging tab
- **Events:** Separate Events → Config section for event logging
- **Debug:** More granular logging categories available

## New Features in 23.0.7

### Enhanced LDAP Support
- Improved connection pooling
- Better error handling for LDAP timeouts
- Enhanced group synchronization

### Security Improvements
- Stronger default password policies
- Enhanced token validation
- Improved CSRF protection

### Performance Optimizations
- Faster user lookup
- Optimized group membership queries
- Better caching mechanisms

## Configuration Differences

### LDAP Provider Settings
```json
{
  "connectionPooling": true,
  "connectionTimeout": "10000",
  "readTimeout": "10000",
  "startTls": false,
  "usePasswordModifyExtendedOp": false,
  "validatePasswordPolicy": false,
  "trustEmail": false,
  "useTruststoreSpi": "ldapsOnly"
}
```

### Attribute Mapper Configuration
- **Required Fields:** Mapper type must be selected first
- **Validation:** Stricter validation on LDAP attribute names
- **Read-Only:** Default setting is now ON for security

### Group Mapper Enhancements
- **Inheritance:** Better support for nested groups
- **Filtering:** Enhanced LDAP filter support
- **Sync Options:** More granular sync control

## Migration Notes

### From Earlier Versions
- Configuration export/import format unchanged
- Existing LDAP providers will continue to work
- UI navigation paths have changed

### Database Schema
- No breaking changes in user federation storage
- Existing user mappings preserved
- Group relationships maintained

## Troubleshooting 23.0.7 Specific Issues

### Common Problems
1. **UI Navigation:** Updated menu structure
2. **Mapper Creation:** New dropdown interface
3. **Group Sync:** Enhanced validation may reject some configurations

### Solutions
1. **Clear Browser Cache:** After Keycloak upgrade
2. **Update Bookmarks:** UI paths have changed
3. **Review Logs:** Enhanced logging provides better error details

## Testing Checklist for 23.0.7

- [ ] LDAP connection test passes
- [ ] User authentication works
- [ ] Attribute mapping functions correctly
- [ ] Group synchronization completes
- [ ] Role assignments are correct
- [ ] Application login succeeds
- [ ] Token claims include expected attributes

## Performance Tuning for 23.0.7

### Connection Settings
```
Connection Pooling: ON
Connection Timeout: 10000ms
Read Timeout: 10000ms
Max Pool Size: 10
```

### Sync Settings
```
Batch Size: 1000
Sync Period: 86400 (24 hours)
Full Sync Period: 604800 (7 days)
```

### Caching
- User cache: Enabled by default
- Group cache: Configure based on AD group count
- Attribute cache: Enable for frequently accessed attributes