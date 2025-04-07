# Crowdsourced Container Recognition System

## Overview

The Crowdsourced Container Recognition System is a collaborative feature that enables users to contribute to expanding EcoCart's recycling database. When the AR scanner fails to recognize a container, users can submit container information and images, which are then verified by other users to ensure accuracy before being added to the database.

## Key Components

### 1. Container Contribution Process

- **ARContainerScanner**: When a container cannot be recognized, users can initiate the contribution process directly from the scanning interface.
- **ContainerContributionForm**: Allows users to provide details about unrecognized containers, including:
  - Container name
  - Material type (plastic, aluminum, glass, paper, etc.)
  - Recyclability status
  - Description
  - Recycling instructions
  - Image capture or upload

### 2. Verification System

- **ContributionVerificationPanel**: Enables users to review and verify container contributions from other users.
- Each contribution requires multiple verifications (default: 3) before being approved and added to the database.
- Users cannot verify their own contributions, ensuring community validation.

### 3. Administration Panel

- **AdminMaterialsDatabaseScreen**: Provides administrative tools for managing the materials database:
  - Review and approve pending contributions
  - Reject contributions with inappropriate content
  - Manage existing materials in the database
  - Filter and search functionality

### 4. Environmental Impact Tracking

- **EnvironmentalImpactUtils**: Calculates the positive environmental impact of recycling different materials:
  - CO2 savings (kg)
  - Water conservation (liters)
  - Energy savings (kWh)
- Impact calculations are displayed to users to incentivize contribution and participation.

## Technical Implementation

### Services

- **MaterialsContributionService**: Manages the lifecycle of container contributions:
  - Submission and validation of new contributions
  - Image handling and storage
  - Verification and approval processes
  - Contribution status tracking (pending, approved, rejected)

### Testing

- **Unit Tests**: Test individual utility functions for environmental impact calculations.
- **Component Tests**: Validate UI components and user interactions for the contribution and verification processes.
- **Integration Tests**: Ensure the complete contribution flow works correctly from scanning to verification.

## User Flow

1. User scans an unrecognized container with the AR scanner
2. System offers option to contribute the container to the database
3. User completes and submits the contribution form with container details and image
4. Contribution enters the verification queue as "pending"
5. Other users verify the contribution through the verification panel
6. Once reaching verification threshold, the container is added to the database
7. Environmental impact metrics are calculated and credited to the contributor

## Future Enhancements

- Machine learning integration to improve recognition accuracy over time
- Gamification elements (badges, points) for active contributors
- Geographic localization of container data to account for regional recycling differences
- Integration with official recycling databases and standards
- Enhanced moderation tools for maintaining database quality 