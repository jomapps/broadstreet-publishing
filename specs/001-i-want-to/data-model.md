# Data Model

This document defines the data models for the Campaign Management Dashboard feature.

## Campaign

Represents a single advertising campaign.

| Field           | Type   | Description                                          | Validation/Constraints      |
|-----------------|--------|------------------------------------------------------|-----------------------------|
| `id`            | Number | The unique identifier for the campaign.              | Required, Integer           |
| `name`          | String | The name of the campaign.                            | Required, Non-empty string  |
| `status`        | String | The current status of the campaign (e.g., "active"). | [NEEDS CLARIFICATION: What are the possible status values?] |
| `startDate`     | Date   | The start date of the campaign.                      | [NEEDS CLARIFICATION: Is this required?] |
| `endDate`       | Date   | The end date of the campaign.                        | [NEEDS CLARIFICATION: Is this required?] |

## CampaignData

Represents the detailed performance data for a single campaign.

| Field         | Type   | Description                                     | Validation/Constraints      |
|---------------|--------|-------------------------------------------------|-----------------------------|
| `campaignId`  | Number | The ID of the campaign this data belongs to.    | Required, Integer           |
| `impressions` | Number | The number of times the campaign has been shown. | Required, Integer >= 0      |
| `clicks`      | Number | The number of clicks the campaign has received. | Required, Integer >= 0      |
| `ctr`         | Number | The click-through rate of the campaign.         | Required, Float >= 0        |
| `spend`       | Number | The amount of money spent on the campaign.      | [NEEDS CLARIFICATION: Currency and format?] |
