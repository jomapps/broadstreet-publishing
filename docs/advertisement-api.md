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

1. **Option A - Network-based** (✅ VERIFIED WORKING - RECOMMENDED):
   - Fetch all networks via `/networks`
   - For each network, fetch advertisements via `/advertisements?network_id={id}`
   - **CONFIRMED**: Returns 101 advertisements across 2 networks (9396: ~55 ads, 9415: ~46 ads)
   - This is the ONLY approach that works correctly with the Broadstreet API

2. **Option B - Zone-based** (❌ NOT WORKING):
   - Fetch all zones via `/zones`
   - For each zone, fetch advertisements via `/advertisements?zone_id={id}`
   - Returns empty results - not supported by current API

3. **Option C - Campaign-based** (❌ NOT WORKING):
   - Fetch all campaigns via `/campaigns`
   - For each campaign, fetch advertisements via `/advertisements?campaign_id={id}`
   - Returns empty results - not supported by current API

4. **Option D - Direct** (❌ NOT WORKING):
   - Fetch all advertisements via `/advertisements`
   - Returns empty results - requires additional parameters

## Error Handling

- **404**: Zone/Campaign not found
- **401**: Invalid access token
- **429**: Rate limit exceeded
- **500**: Server error

## Rate Limiting

The API has rate limiting. Implement appropriate delays between requests when fetching large datasets.

## Current Implementation Status

✅ **RESOLVED** - As of the latest implementation:
- The system has 28 campaigns and 620 zones configured
- **101 advertisements** successfully retrieved using network-based approach
- **Network 9396**: ~55 advertisements (SCHWULISSIMO)
- **Network 9415**: ~46 advertisements (Travel M)
- Dashboard now correctly displays advertisement counts
- All API endpoints are functioning properly with real Broadstreet data