# Init:
The idea of this mobile application is to create an app that allows user to manage their growing process on indoor climbing. It acts as a diary allowing them to capture images of their boulder problems, track their progress, and set goals for improvement.

# Basic features:
- Take image of the boulder problem and save it in the app.
- Track the number of attempts and successful completions for each boulder problem.
- Set goals for improvement and track progress over time.
- Take notes on each boulder problem, including difficulty level, techniques used, and personal reflections.
- View a history of all boulder problems attempted, including images, notes, and progress tracking.

## 1st scale: 
- Ability to create and manage a list of boulder problems.
- Ability to add images, notes, and progress tracking for each boulder problem.
- Network connectivity to sync data across devices.
- Share progress and achievements with friends or on social media platforms.

## 2nd scale:
- User authentication and profile management.
- Allow users to create and join climbing groups or communities within the app.

# Stacks:
1. Frontend: React Native for cross-platform mobile development.
2. Backend: Node.js with Express for API development.
3. Database: MongoDB for storing user data, boulder problems, images, and progress tracking.
4. Cloud Storage: AWS S3 for storing images of boulder problems.

# Init pages (3 pages):

## Home screen (Thao):

- upload problem section
- statistic view section
- accessories section
- gear section

## Upload problem page (Duy):

On upload problem button click.

There will be 3 ares placed vertically: Upload area, Metadata area, and Comment area. 

Upload area will have the function to upload image (and video in the future) of the boulder problem.

Request making to the backend: POST with the image file and the metadata (name, grade, location, etc.) in the request body. The backend will store the image in AWS S3 and save the metadata in MongoDB.


## Upload page (Duy):

On clicking onto each problem in the dashboard view

The frontend would look the same as the upload problem page, but the data will be fetched from the backend and displayed in the respective areas. The user can edit the metadata and add comments.

# Action plan

1. Initialize the project with React Native, node.js, and set up the basic folder structure (1 hour)
2. Build a sample home page with problems area and upload button (1 hour) 
3. Build a generic pipeline for problem page without mongoDB and AWS S3 (2 hours)
4. Build a docker image for S3 and test the upload functionality (2 hours)
5. Integrate MongoDB and test the upload functionality with metadata (2 hours)
6. Connect all the pages and test the pipeline (2 hours)

Total time: 10 hours (3 days)