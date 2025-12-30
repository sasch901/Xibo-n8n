# Xibo n8n Node - Vollständige Implementierungs-Plan

## Aktuelle Situation (Stand 0.2.1)

### ✅ Bereits implementiert:
- **13 Ressourcen**: Display, Layout, Library, Schedule, DisplayGroup, Campaign, Playlist, DataSet, Command, Tag, User, Notification, Folder
- **OAuth2 Authentifizierung**: Client Credentials Grant Type
- **Resource Locators**: Dropdown-Auswahl für Display, Layout, Campaign, DisplayGroup
- **Pagination**: Automatisches Fetchen aller Ergebnisse für alle `getAll` Operationen
- **File Upload**: Media Library Upload-Funktion

### ❌ Bekannte Probleme:
1. **Fehlende Update-Fields**: Bei vielen Update-Operationen fehlen die updateFields Parameter (z.B. DataSet Update)
2. **Fehlende Create-Fields**: Einige Create-Operationen haben unvollständige Parameter
3. **Keine Filters für getAll**: Nur Display hat vollständige Filter-Optionen
4. **Fehlende Operationen**: Einige wichtige API-Endpunkte sind nicht implementiert

---

## Phase 1: Parameter-Vervollständigung (Priorität: HOCH)

### 1.1 DataSet Resource
**Problem**: Update-Operation hat keine Body-Parameter

**Zu implementieren**:
```typescript
// Add to DataSet update operation
{
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
        show: {
            resource: ['dataset'],
            operation: ['update'],
        },
    },
    options: [
        {
            displayName: 'DataSet Name',
            name: 'dataSet',
            type: 'string',
            default: '',
        },
        {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            default: '',
        },
        {
            displayName: 'Owner ID',
            name: 'ownerId',
            type: 'string',
            default: '',
        },
    ],
}
```

**Execute-Logic**:
```typescript
} else if (operation === 'update') {
    const dataSetId = this.getNodeParameter('dataSetId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

    responseData = await xiboApiRequest(
        this,
        'PUT',
        `/api/dataset/${dataSetId}`,
        accessToken,
        baseUrl,
        updateFields,
    );
}
```

**API-Referenz**: `PUT /api/dataset/{dataSetId}`

---

### 1.2 Tag Resource
**Problem**: Update-Operation fehlt Tag-Name Parameter

**Zu implementieren**:
```typescript
{
    displayName: 'Tag Name',
    name: 'tag',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['tag'],
            operation: ['update'],
        },
    },
    default: '',
    description: 'The new name for the tag',
},
```

---

### 1.3 User Resource
**Problem**: Create braucht mehr Parameter, Update fehlt updateFields

**Zu implementieren für Create**:
- `password` (required bei Create)
- `email`
- `libraryQuota`
- `homePageId`

**Zu implementieren für Update**:
- updateFields Collection mit allen editierbaren Feldern

---

### 1.4 Playlist Resource
**Problem**: addMedia/removeMedia Operationen fehlen komplett

**Neue Operationen hinzufügen**:
- `Add Widget` - Fügt Media/Widget zu Playlist hinzu
- `Remove Widget` - Entfernt Media/Widget aus Playlist
- `Order Widgets` - Sortiert Widgets in Playlist

**API-Referenzen**:
- `POST /api/playlist/library/assign/{playlistId}`
- `POST /api/playlist/library/unassign/{playlistId}`

---

### 1.5 Campaign Resource
**Problem**: assignLayout Operation hat unvollständige Implementierung

**Zu vervollständigen**:
- Body-Parameter korrekt implementieren
- unassignLayout Operation hinzufügen

---

### 1.6 Library Resource
**Problem**: Update hat nur 3 Felder, API unterstützt mehr

**Zu implementieren**:
```typescript
options: [
    { displayName: 'Name', name: 'name', type: 'string' },
    { displayName: 'Duration', name: 'duration', type: 'number' },
    { displayName: 'Retired', name: 'retired', type: 'boolean' },
    { displayName: 'Tags', name: 'tags', type: 'string' },
    { displayName: 'Update In Layouts', name: 'updateInLayouts', type: 'boolean' },
    { displayName: 'Delete Old Revisions', name: 'deleteOldRevisions', type: 'boolean' },
],
```

---

## Phase 2: Fehlende Operationen (Priorität: MITTEL)

### 2.1 Layout Resource
**Fehlende Operationen**:
- `Retire` - `PUT /api/layout/retire/{layoutId}`
- `Unretire` - `PUT /api/layout/unretire/{layoutId}`
- `Import` - `POST /api/layout/import`
- `Export` - `GET /api/layout/export/{layoutId}`

### 2.2 DisplayGroup Resource
**Fehlende Operationen**:
- `Assign Display` - `POST /api/displaygroup/{displayGroupId}/display/assign`
- `Unassign Display` - `POST /api/displaygroup/{displayGroupId}/display/unassign`
- `Collect Now` - Triggert sofortiges Sammeln von Stats

### 2.3 Display Resource
**Fehlende Operationen**:
- `Move to Display Group` - `POST /api/display/{displayId}/move/{displayGroupId}`
- `Set Default Layout` - `PUT /api/display/{displayId}/defaultlayout/{layoutId}`

### 2.4 Schedule Resource
**Problem**: Create-Operation fehlt Body-Parameter

**Zu implementieren**: Alle required und optional Fields laut Swagger:
- `eventTypeId` (required)
- `campaignId` / `layoutId` / `commandId` (je nach eventTypeId)
- `displayGroupIds` (required)
- `fromDt` (required)
- `toDt` (required)
- `dayPartId` (optional)
- `priority` (optional)
- `recurrence` options (optional)

---

## Phase 3: Filters für getAll Operationen (Priorität: MITTEL)

Aktuell hat nur Display vollständige Filter. Alle anderen Ressourcen brauchen:

### 3.1 Layout getAll Filters
```typescript
options: [
    { displayName: 'Return All', ... },
    { displayName: 'Limit', ... },
    { displayName: 'Layout Name', name: 'layout', type: 'string' },
    { displayName: 'Owner ID', name: 'ownerId', type: 'string' },
    { displayName: 'Tags', name: 'tags', type: 'string' },
    { displayName: 'Retired', name: 'retired', type: 'boolean' },
],
```

### 3.2 Library getAll Filters
```typescript
options: [
    { displayName: 'Return All', ... },
    { displayName: 'Limit', ... },
    { displayName: 'Media Name', name: 'media', type: 'string' },
    { displayName: 'Type', name: 'type', type: 'string' },
    { displayName: 'Owner ID', name: 'ownerId', type: 'string' },
    { displayName: 'Tags', name: 'tags', type: 'string' },
    { displayName: 'Retired', name: 'retired', type: 'boolean' },
],
```

### 3.3 Alle anderen Ressourcen analog

---

## Phase 4: Advanced Features (Priorität: NIEDRIG)

### 4.1 Bulk Operations
- Bulk Display Authorization
- Bulk Tag Assignment
- Bulk Display Group Assignment

### 4.2 Report-Endpunkte
- Display Usage Reports
- Library Usage Reports
- Proof of Play Reports

### 4.3 Notification-Endpunkte
- Send Notification
- Mark as Read

---

## Umsetzungs-Reihenfolge (Empfehlung)

### Sprint 1: Kritische Fixes (2-3 Stunden)
1. ✅ DataSet Update Fields hinzufügen
2. ✅ Tag Update Field hinzufügen
3. ✅ User Create/Update vervollständigen
4. ✅ Schedule Create Body-Parameter hinzufügen
5. ✅ Library Update Fields erweitern

### Sprint 2: Wichtige Operationen (3-4 Stunden)
6. ✅ Playlist Widget-Management (Add/Remove/Order)
7. ✅ Campaign assign/unassign Layout
8. ✅ Layout Retire/Unretire
9. ✅ DisplayGroup Display assign/unassign

### Sprint 3: Filters & Polish (2-3 Stunden)
10. ✅ Filters für alle getAll Operationen hinzufügen
11. ✅ Resource Locators für weitere IDs (Playlist, Media, etc.)
12. ✅ Error-Handling verbessern

### Sprint 4: Advanced Features (optional)
13. ✅ Layout Import/Export
14. ✅ Report-Endpunkte
15. ✅ Bulk Operations

---

## Testing-Checkliste

Für jede Ressource prüfen:
- [ ] **Create**: Alle required Fields vorhanden, Operation funktioniert
- [ ] **Get**: ID-Parameter funktioniert, Daten werden korrekt zurückgegeben
- [ ] **Get Many**: Pagination funktioniert, Filters wirken korrekt
- [ ] **Update**: updateFields Collection vorhanden, alle wichtigen Felder editierbar
- [ ] **Delete**: Funktioniert korrekt
- [ ] **Spezial-Operationen**: Alle resource-spezifischen Operationen testen

---

## Swagger-Referenz Mapping

| Ressource | Swagger Tag | Implementierte Ops | Fehlende Ops |
|-----------|-------------|-------------------|--------------|
| Display | `display` | 7/10 | Move, SetDefaultLayout, Screenshots |
| Layout | `layout` | 8/12 | Retire, Unretire, Import, Export |
| Library | `library` | 5/8 | Replace, Copy, Download |
| Schedule | `schedule` | 5/7 | Recurrence Details, Exceptions |
| DisplayGroup | `displaygroup` | 7/10 | Assign/Unassign Display, Collect |
| Campaign | `campaign` | 6/8 | Unassign Layout, Retire |
| Playlist | `playlist` | 5/10 | Add/Remove/Order Widgets |
| DataSet | `dataset` | 6/12 | Import, Export, Column Management |
| Command | `command` | 2/4 | Create, Update |
| Tag | `tag` | 5/6 | Tag to Item Assignment |
| User | `user` | 5/8 | Permissions, Groups |
| Notification | `notification` | 2/5 | Create, Update, Mark as Read |
| Folder | `folder` | 3/6 | Update, Delete, Move Items |

---

## Nächste Schritte

1. **User-Feedback einholen**: Welche Features sind am wichtigsten?
2. **Sprint 1 umsetzen**: Kritische Parameter-Fixes
3. **Inkrementell testen**: Nach jedem Fix testen
4. **Version 0.3.0**: Release mit vollständigen Update-Parametern
5. **Version 0.4.0**: Release mit allen wichtigen Operationen
