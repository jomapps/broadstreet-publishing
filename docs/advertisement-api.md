# Broadstreet Advertisement API Documentation

## Overview

This document summarizes the Broadstreet API endpoints for managing advertisements based on investigation and API structure analysis.

## API Base URL
```
https://api.broadstreetads.com/api/1
```

## Authentication
All requests require an `access_token` parameter:
```
?access_token=your-token-here
```

## Advertisement Endpoints

### 1. Get Advertisements by Zone
```
GET /advertisements?zone_id={zone_id}&access_token={token}
```

**Description**: Retrieves all advertisements associated with a specific zone/placement.

**Parameters**:
- `zone_id` (required): The ID of the zone to fetch advertisements for
- `access_token` (required): API authentication token

**Response Structure**:
```json
{
  "advertisements": [
    {
      "id": 12345,
      "name": "Advertisement Name",
      "campaign_id": 67890,
      "advertiser_id": 111,
      "zone_id": 222,
      "type": "banner|text|video|native",
      "status": "active|paused|inactive",
      "width": 300,
      "height": 250,
      "url": "https://example.com/click-target",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Get Advertisements by Campaign
```
GET /advertisements?campaign_id={campaign_id}&access_token={token}
```

**Description**: Retrieves all advertisements associated with a specific campaign.

**Parameters**:
- `campaign_id` (required): The ID of the campaign to fetch advertisements for
- `access_token` (required): API authentication token

### 3. Get All Advertisements
```
GET /advertisements?access_token={token}
```

**Description**: Retrieves all advertisements across all campaigns and zones.

## Advertisement Types

Based on the Broadstreet structure documentation:

- **banner**: Image-based advertisements with width/height dimensions
- **text**: Text-only advertisements
- **video**: Video advertisements
- **native**: Native advertising content

## Advertisement Status

- **active**: Advertisement is currently running
- **paused**: Advertisement is temporarily stopped
- **inactive**: Advertisement is not running

## Integration Notes

1. **Hierarchical Structure**: Advertisements are linked to both campaigns and zones
2. **Campaign Relationship**: Each advertisement belongs to a campaign (advertiser + date range)
3. **Zone Placement**: Advertisements are displayed in specific zones (placements)
4. **Multiple Zones**: One advertisement can appear in multiple zones

## API Call Strategy

For fetching all advertisements in the system:

1. **Option A - Zone-based** (Recommended):
   - Fetch all zones via `/zones`
   - For each zone, fetch advertisements via `/advertisements?zone_id={id}`
   - This ensures you get advertisements that are actually placed

2. **Option B - Campaign-based**:
   - Fetch all campaigns via `/campaigns`
   - For each campaign, fetch advertisements via `/advertisements?campaign_id={id}`
   - This gets all advertisements regardless of placement status

3. **Option C - Direct**:
   - Fetch all advertisements via `/advertisements`
   - Single call but may include unplaced advertisements

## Error Handling

- **404**: Zone/Campaign not found
- **401**: Invalid access token
- **429**: Rate limit exceeded
- **500**: Server error

## Rate Limiting

The API has rate limiting. Implement appropriate delays between requests when fetching large datasets.

## Current Implementation Status

As of the latest investigation:
- The system has 28 campaigns and 620 zones configured
- No advertisements are currently configured in the Broadstreet system
- This is normal for a new setup where placements are ready but ads haven't been uploaded yet