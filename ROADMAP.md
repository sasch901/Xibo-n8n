# Xibo n8n Node - Vollständiger Feature-Roadmap

## 🎯 Ziel
Alle wichtigen Xibo CMS v4 API-Funktionen in n8n verfügbar machen mit vollständigen Parametern und User-freundlichen Interfaces.

---

## 📊 Aktueller Stand (Version 0.2.2)

### ✅ Funktioniert bereits:
- OAuth2 Authentifizierung
- Pagination für alle getAll Operationen
- Resource Locators für Display, Layout, Campaign, DisplayGroup
- File Upload für Media Library
- 13 Ressourcen mit Basis-Operationen

### ❌ Mängel:
- Update-Operationen haben oft keine oder unvollständige updateFields
- Create-Operationen fehlen wichtige Parameter
- Keine dynamischen Felder (z.B. DataSet Columns)
- Fehlende Filter-Optionen bei getAll
- Viele wichtige API-Endpunkte nicht implementiert

---

## 🚀 Arbeitsplan - Phase für Phase

### **PHASE 1: Kritische Parameter-Fixes** (Priorität: URGENT)
*Ziel: Alle existierenden Operationen müssen funktionieren*

#### 1.1 DataSet Resource ⭐ WICHTIG
**Problem**: Keine updateFields, keine dynamischen Columns

**Aufgaben**:
- [ ] DataSet-Dropdown in loadOptions hinzufügen
- [ ] DataSet Columns dynamisch laden (loadOptions)
- [ ] Update-Operation mit updateFields Collection
- [ ] addRow Operation mit dynamischen Column-Feldern
- [ ] deleteRow Operation
- [ ] Test: DataSet erstellen, Row hinzufügen, updaten, löschen

**API-Endpunkte**:
```
GET /api/dataset -> Liste
GET /api/dataset/{id} -> Details
PUT /api/dataset/{id} -> Update Name/Description
GET /api/dataset/{id}/column -> Columns laden
POST /api/dataset/data/{id} -> Row hinzufügen
PUT /api/dataset/data/{id}/{rowId} -> Row updaten
DELETE /api/dataset/data/{id}/{rowId} -> Row löschen
```

**Implementierung (Code-Vorlage)**:
```typescript
// In loadOptions:
async getDataSets(): Promise<INodePropertyOptions[]> {
    const credentials = await this.getCredentials('xiboApi');
    const accessToken = await getAccessToken(this as any, credentials);
    const baseUrl = (credentials.url as string).replace(/\/$/, '');
    const dataSets = await xiboApiRequestAllItems(
        this as any,
        '/api/dataset',
        accessToken,
        baseUrl,
    );
    return dataSets.map((ds: any) => ({
        name: ds.dataSet,
        value: ds.dataSetId,
    }));
}

async getDataSetColumns(): Promise<INodePropertyOptions[]> {
    const dataSetId = this.getCurrentNodeParameter('dataSetId');
    const credentials = await this.getCredentials('xiboApi');
    const accessToken = await getAccessToken(this as any, credentials);
    const baseUrl = (credentials.url as string).replace(/\/$/, '');
    const columns = await xiboApiRequest(
        this as any,
        'GET',
        `/api/dataset/${dataSetId}/column`,
        accessToken,
        baseUrl,
    );
    return columns.map((col: any) => ({
        name: col.heading,
        value: col.dataSetColumnId,
    }));
}
```

---

#### 1.2 Schedule Resource
**Problem**: Create-Operation hat keine Body-Parameter

**Aufgaben**:
- [ ] eventTypeId Parameter (required) - Options: Layout, Command, Action
- [ ] Conditional Fields: layoutId ODER commandId ODER action
- [ ] displayGroupIds Parameter (required, multi-select)
- [ ] fromDt/toDt Datetime-Felder
- [ ] dayPartId Optional-Parameter
- [ ] priority Optional-Parameter
- [ ] Recurrence Fields (Optional Collection)
- [ ] Test: Schedule erstellen mit Layout, mit Command, mit Recurrence

**API-Referenz**: `POST /api/schedule`

---

#### 1.3 User Resource
**Problem**: Create braucht Pflichtfelder, Update hat keine updateFields

**Aufgaben**:
- [ ] Create: password-Field hinzufügen (required)
- [ ] Create: email-Field hinzufügen
- [ ] Create: libraryQuota-Field
- [ ] Update: updateFields Collection mit allen Feldern
- [ ] Test: User erstellen, updaten, löschen

---

#### 1.4 Tag Resource
**Problem**: Update hat kein tag-Field

**Aufgaben**:
- [ ] Update: tag-Name Field hinzufügen
- [ ] Test: Tag erstellen, umbenennen, löschen

---

#### 1.5 Library Resource
**Problem**: Update hat nur 3 Felder, API hat mehr

**Aufgaben**:
- [ ] retired Field hinzufügen
- [ ] updateInLayouts Field
- [ ] deleteOldRevisions Field
- [ ] ownerId Field
- [ ] folderId Field
- [ ] Test: Media Update mit allen Feldern

---

### **PHASE 2: Erweiterte Operationen** (Priorität: HIGH)

#### 2.1 Playlist Widget Management ⭐ WICHTIG
**Neue Operationen**:
- [ ] Add Widget to Playlist
- [ ] Remove Widget from Playlist
- [ ] Order Widgets

**API-Endpunkte**:
```
POST /api/playlist/library/assign/{playlistId}
POST /api/playlist/library/unassign/{playlistId}
POST /api/playlist/order/{playlistId}
```

---

#### 2.2 Layout Advanced Operations
**Neue Operationen**:
- [ ] Retire Layout
- [ ] Unretire Layout
- [ ] Copy Layout
- [ ] Export Layout
- [ ] Import Layout

**API-Endpunkte**:
```
PUT /api/layout/retire/{layoutId}
PUT /api/layout/unretire/{layoutId}
POST /api/layout/copy/{layoutId}
GET /api/layout/export/{layoutId}
POST /api/layout/import
```

---

#### 2.3 DisplayGroup Display Management
**Neue Operationen**:
- [ ] Assign Display to Group
- [ ] Unassign Display from Group
- [ ] Collect Now (trigger stats collection)

**API-Endpunkte**:
```
POST /api/displaygroup/{id}/display/assign
POST /api/displaygroup/{id}/display/unassign
POST /api/displaygroup/{id}/action/collectNow
```

---

#### 2.4 Campaign Layout Management
**Aufgaben**:
- [ ] assignLayout: Body-Parameter korrigieren
- [ ] unassignLayout Operation hinzufügen

**API-Endpunkte**:
```
POST /api/campaign/layout/assign/{campaignId}
POST /api/campaign/layout/unassign/{campaignId}
```

---

#### 2.5 Display Advanced Operations
**Neue Operationen**:
- [ ] Move to Display Group
- [ ] Set Default Layout
- [ ] Get Screenshot

**API-Endpunkte**:
```
POST /api/display/{id}/move/{displayGroupId}
PUT /api/display/{id}/defaultlayout/{layoutId}
GET /api/display/screenshot/{id}
```

---

### **PHASE 3: Filters & UX** (Priorität: MEDIUM)

#### 3.1 Filter für alle getAll Operationen
Aktuell hat nur Display vollständige Filter. Zu implementieren:

- [ ] **Layout getAll**: layout, ownerId, tags, retired, folderId
- [ ] **Library getAll**: media, type, ownerId, tags, retired
- [ ] **Campaign getAll**: campaign, ownerId, tags
- [ ] **Playlist getAll**: name, ownerId, tags
- [ ] **DataSet getAll**: dataSet, ownerId
- [ ] **Schedule getAll**: eventTypeId, displayGroupId, fromDt, toDt
- [ ] **DisplayGroup getAll**: displayGroup, tags
- [ ] **User getAll**: userName, userTypeId, retired
- [ ] **Tag getAll**: tag
- [ ] **Folder getAll**: folderName

**Code-Template für jeden**:
```typescript
{
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
        show: {
            resource: ['xxx'],
            operation: ['getAll'],
        },
    },
    options: [
        {
            displayName: 'Return All',
            name: 'returnAll',
            type: 'boolean',
            default: false,
        },
        {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            displayOptions: { show: { returnAll: [false] } },
            typeOptions: { minValue: 1 },
            default: 50,
        },
        // ... spezifische Filter
    ],
}
```

---

#### 3.2 Mehr Resource Locators
- [ ] Playlist-Dropdown
- [ ] Media-Dropdown
- [ ] DataSet-Dropdown (bereits geplant für 1.1)
- [ ] Command-Dropdown
- [ ] Folder-Dropdown
- [ ] Tag-Dropdown

---

### **PHASE 4: Advanced Features** (Priorität: LOW)

#### 4.1 DataSet Advanced
- [ ] Import CSV
- [ ] Export CSV
- [ ] Column Management (Create, Update, Delete)
- [ ] Clear Data

#### 4.2 Notifications
- [ ] Create Notification
- [ ] Mark as Read
- [ ] Delete Notification

#### 4.3 Command Resource
- [ ] Create Command
- [ ] Update Command

#### 4.4 Folder Management
- [ ] Update Folder
- [ ] Delete Folder
- [ ] Move Items to Folder

---

## 📋 Umsetzungsreihenfolge (Konkrete Schritte)

### Sprint 1: DataSet & Schedule (JETZT)
**Dauer**: 2-3 Stunden

1. ✅ **DataSet loadOptions** - DataSets & Columns laden
2. ✅ **DataSet Update** - updateFields hinzufügen
3. ✅ **DataSet Row Operations** - addRow, deleteRow mit dynamischen Feldern
4. ✅ **Schedule Create** - Alle required Parameter
5. ✅ **Test**: DataSet-Workflow von Anfang bis Ende

**Erfolgskriterium**: User kann DataSet erstellen, Daten hinzufügen und updaten

---

### Sprint 2: User, Tag, Library (DANACH)
**Dauer**: 1-2 Stunden

6. ✅ **User Create/Update** - Alle Felder
7. ✅ **Tag Update** - tag-Field
8. ✅ **Library Update** - Erweiterte Felder
9. ✅ **Test**: User-Management, Tag-Management

**Erfolgskriterium**: Alle Update-Operationen haben vollständige Parameter

---

### Sprint 3: Playlist & Campaign (DANN)
**Dauer**: 2 Stunden

10. ✅ **Playlist Widget Operations** - Add/Remove/Order
11. ✅ **Campaign Layout Operations** - Assign/Unassign korrigieren
12. ✅ **Test**: Playlist mit Widgets befüllen, Campaign mit Layouts

**Erfolgskriterium**: Playlist-Management vollständig funktional

---

### Sprint 4: Filters (OPTIONAL)
**Dauer**: 2-3 Stunden

13. ✅ **Filter für 8 Ressourcen** - Layout, Library, Campaign, etc.
14. ✅ **Test**: Filter funktionieren korrekt

**Erfolgskriterium**: Alle getAll haben sinnvolle Filter

---

### Sprint 5: Advanced Features (OPTIONAL)
**Dauer**: 3-4 Stunden

15. ✅ **Layout Operations** - Retire, Copy, Export, Import
16. ✅ **DisplayGroup Operations** - Display Assign/Unassign
17. ✅ **Display Operations** - Move, Set Default Layout
18. ✅ **Resource Locators** - Für Playlist, Media, etc.

**Erfolgskriterium**: Alle wichtigen Use-Cases abgedeckt

---

## 🧪 Test-Matrix

Für jede Ressource nach jedem Sprint:

| Resource | Create | Get | Get Many | Update | Delete | Special Ops | Status |
|----------|--------|-----|----------|--------|--------|-------------|--------|
| Display | N/A | ✅ | ✅ | ⚠️ | N/A | ⚠️ | 60% |
| Layout | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ | 60% |
| Library | ❌ | ✅ | ✅ | ⚠️ | ✅ | ✅ | 70% |
| Schedule | ❌ | ✅ | ✅ | ⚠️ | ✅ | N/A | 40% |
| DisplayGroup | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | 60% |
| Campaign | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | 60% |
| Playlist | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ | 50% |
| DataSet | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | 30% |
| Command | N/A | ✅ | ✅ | N/A | N/A | N/A | 100% |
| Tag | ✅ | ✅ | ✅ | ❌ | ✅ | N/A | 60% |
| User | ❌ | ✅ | ✅ | ❌ | ✅ | N/A | 40% |
| Notification | N/A | ✅ | ✅ | N/A | N/A | N/A | 100% |
| Folder | ✅ | ✅ | ✅ | N/A | N/A | N/A | 60% |

**Legende:**
- ✅ Vollständig implementiert
- ⚠️ Teilweise (fehlende Parameter)
- ❌ Fehlt komplett
- N/A Nicht relevant

---

## 📌 Nächster konkreter Schritt

**STARTE MIT**: Sprint 1 - DataSet & Schedule

```bash
# 1. DataSet Dropdown + Columns
# 2. DataSet Update Fields
# 3. DataSet addRow/deleteRow
# 4. Schedule Create Fields
# 5. Alles testen
```

**Zeitaufwand**: ~2-3 Stunden
**Impact**: Hoch - DataSets sind eine der wichtigsten Features für Daten-Integration

---

## 🎓 Referenzen

- [Xibo API Swagger UI](https://xibosignage.com/manual/api/)
- [Xibo API Dokumentation](https://xibosignage.com/docs/developer/cms-api/)
- [Xibo Swagger JSON](https://xibosignage.com/manual/swagger.json)
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
