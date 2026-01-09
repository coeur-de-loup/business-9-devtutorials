# Admin Content Moderation Panel

## Overview

The admin content moderation panel provides a comprehensive interface for reviewing, approving, and rejecting tutorial submissions. It ensures quality control and maintains platform standards.

## Features

### 1. Admin Dashboard (`/admin`)

**Endpoint:** `GET /api/admin/tutorials`

**Query Parameters:**
- `status`: Filter by tutorial status (`PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `ALL`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "tutorials": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "PENDING_REVIEW",
      "price": number,
      "category": "string",
      "level": "string",
      "creator": {
        "id": "string",
        "name": "string",
        "email": "string",
        "image": "string"
      },
      "curriculum": [...],
      "requirements": [...],
      "learningGoals": [...],
      "adminNotes": "string | null",
      "createdAt": "ISO date",
      "_count": {
        "purchases": number,
        "reviews": number
      }
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

**Features:**
- View all tutorials pending review
- Filter by status (Pending, Published, Rejected, All)
- Pagination support
- Sort by creation date
- Quick stats overview

### 2. Tutorial Review Panel

**Endpoint:** `GET /api/admin/tutorials/[id]`

**Response:** Detailed tutorial information including:
- Tutorial metadata
- Creator information
- Curriculum (lessons)
- Video assets
- Purchase and review counts

**Endpoint:** `PATCH /api/admin/tutorials/[id]`

**Request Body:**
```typescript
{
  action: 'approve' | 'reject',
  adminNotes?: string,
  rejectionReasons?: string[]
}
```

**Approve Action:**
- Changes status to `PUBLISHED`
- Sets `publishedAt` timestamp
- Calculates `freshnessExpires` (6 months from publish date)
- Records admin reviewer ID and timestamp

**Reject Action:**
- Changes status to `REJECTED`
- Stores rejection reasons and admin notes
- Records admin reviewer ID and timestamp
- Tutorial remains in creator's dashboard for revision

### 3. Quality Checklist

The review panel includes a 10-item quality checklist across categories:

**Content Quality:**
- Content is accurate and well-structured
- Code examples are correct and runnable
- Learning objectives are clearly defined
- Prerequisites are accurately listed
- Content difficulty matches stated level

**Production Quality:**
- Audio is clear and professional
- Video quality is acceptable (720p+)

**Legal:**
- No copyright violations detected
- Content appears to be original

**Business:**
- Price is reasonable for content value

### 4. Rejection Reasons

Predefined rejection reasons for quick selection:
- Poor audio/video quality
- Inaccurate or outdated information
- Missing code examples or broken code
- Unclear learning objectives
- Prerequisites not accurately listed
- Content difficulty mismatch
- Copyright concerns
- Plagiarism detected
- Inappropriate pricing
- Other (specify in notes)

## Authentication & Authorization

All admin endpoints require:
1. **Authentication**: Valid user session
2. **Authorization**: User role must be `ADMIN`

Implementation uses `requireRole(request, 'ADMIN')` from `lib/auth.ts`.

## Database Schema

### Tutorial Model Fields Used

```prisma
model Tutorial {
  status            TutorialStatus  // DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED
  adminNotes        String?         @db.Text  // Admin feedback
  reviewedAt        DateTime?       // Review timestamp
  reviewedBy        String?         // Admin user ID
  publishedAt       DateTime?       // Publication date
  freshnessExpires  DateTime?       // 6 months from publishedAt
  lastUpdated       DateTime        // Always updated on review
}
```

## Workflow

### 1. Creator Submits Tutorial
- Tutorial status: `DRAFT`
- Creator clicks "Submit for Review"
- Status changes to `PENDING_REVIEW`

### 2. Admin Reviews Tutorial
- Admin navigates to `/admin`
- Views pending tutorials list
- Clicks on tutorial to review

### 3. Admin Makes Decision

**Approve:**
1. Review quality checklist
2. Verify content standards
3. Click "Approve & Publish"
4. Optional: Add admin notes
5. Tutorial goes live on marketplace

**Reject:**
1. Identify issues
2. Select rejection reasons
3. Provide detailed feedback
4. Click "Reject"
5. Tutorial returned to creator

### 4. Creator Notification (Future)
- Email notification sent to creator
- Creator views feedback in dashboard
- Creator makes revisions
- Creator resubmits for review

## UI Components

### AdminDashboard (`app/(admin)/admin/page.tsx`)

Main dashboard component with:
- Tutorial list with filters
- Pagination controls
- Status badges
- Quick stats
- Click to review

### TutorialReviewPanel (`components/admin/TutorialReviewPanel.tsx`)

Modal review panel with:
- Tutorial overview section
- Learning goals display
- Prerequisites list
- Curriculum breakdown
- Quality checklist (10 items)
- Action selection (Approve/Reject)
- Rejection reasons (multi-select)
- Admin notes textarea
- Submit/Cancel buttons

## Testing

### Manual Testing Steps

1. **Create Admin User:**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

2. **Create Pending Tutorial:**
```sql
UPDATE "Tutorial" SET status = 'PENDING_REVIEW' WHERE id = 'tutorial-id';
```

3. **Test Dashboard:**
- Navigate to `/admin`
- Verify pending tutorials appear
- Test filters (status, pagination)
- Click tutorial to open review panel

4. **Test Approval:**
- Review quality checklist
- Click "Approve & Publish"
- Verify status changes to `PUBLISHED`
- Check `publishedAt` and `freshnessExpires` set

5. **Test Rejection:**
- Select rejection reasons
- Add admin notes
- Click "Reject"
- Verify status changes to `REJECTED`
- Check `adminNotes` contains feedback

6. **Test Authorization:**
- Try accessing `/api/admin/tutorials` as non-admin
- Verify 403 Forbidden response

## API Examples

### Fetch Pending Tutorials
```bash
curl http://localhost:3000/api/admin/tutorials?status=PENDING_REVIEW&page=1&limit=20
```

### Get Tutorial Details
```bash
curl http://localhost:3000/api/admin/tutorials/tutorial-id
```

### Approve Tutorial
```bash
curl -X PATCH http://localhost:3000/api/admin/tutorials/tutorial-id \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "adminNotes": "Great content! Approved for publication."
  }'
```

### Reject Tutorial
```bash
curl -X PATCH http://localhost:3000/api/admin/tutorials/tutorial-id \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject",
    "adminNotes": "Please improve audio quality in lessons 3-5.",
    "rejectionReasons": ["Poor audio/video quality", "Other (specify in notes)"]
  }'
```

## Error Handling

### 401 Unauthorized
- User not authenticated
- Session expired

### 403 Forbidden
- User not authorized (not an admin)
- Invalid role

### 404 Not Found
- Tutorial does not exist

### 400 Bad Request
- Invalid request body
- Missing required fields

### 500 Internal Server Error
- Database connection issues
- Unexpected server errors

## Security Considerations

1. **Role-Based Access Control**: Only ADMIN role can access
2. **Authentication Required**: All endpoints require valid session
3. **Input Validation**: Zod schema validates request bodies
4. **SQL Injection Prevention**: Prisma ORM used
5. **Audit Trail**: `reviewedBy` and `reviewedAt` track all actions

## Future Enhancements

### Phase 2 (Post-MVP)
- [ ] Creator notification emails
- [ ] Review history log
- [ ] Bulk review actions
- [ ] Advanced filtering (category, creator, date range)
- [ ] Review queue assignment
- [ ] Review performance metrics

### Phase 3 (Scale)
- [ ] Multi-admin workflow
- [ ] Escalation system
- [ ] Automated quality checks
- [ ] Creator appeal process
- [ ] Review analytics dashboard

## Implementation Checklist

- [x] Admin API endpoints (list, detail, review)
- [x] Admin dashboard UI
- [x] Tutorial review panel modal
- [x] Quality checklist (10 items)
- [x] Rejection reasons (10 options)
- [x] Pagination support
- [x] Authentication/authorization
- [x] Error handling
- [ ] Unit tests
- [ ] Integration tests
- [ ] Creator notifications
- [ ] Email templates

## Files Created

```
app/api/admin/tutorials/route.ts          # List tutorials
app/api/admin/tutorials/[id]/route.ts     # Get detail & review
app/(admin)/admin/page.tsx                # Admin dashboard
components/admin/TutorialReviewPanel.tsx  # Review modal
docs/technical/admin-moderation-guide.md  # This file
```

## Deployment Notes

### Environment Variables
No additional environment variables required. Uses existing `DATABASE_URL`.

### Database Migrations
No schema changes needed. Uses existing Tutorial model fields.

### Build Verification
```bash
npm run build
npm run test
npm run lint
```

All must pass before deployment.

## Support

For issues or questions:
1. Check error logs in Vercel/dashboard
2. Verify user role is ADMIN
3. Check tutorial status is PENDING_REVIEW
4. Review authentication session
5. Test API endpoints directly (curl)
