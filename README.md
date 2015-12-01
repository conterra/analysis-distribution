# Analysis / Distribution Bundle
The Analysis / Distribution Bundle counts the distribution of unique values of features and display the results as chart.

It analyses feature types in a defined AGSStore that have coded values and creates a tab with chart showing the distribution of them. Every coded value will be counted and displayed. You can switch between columnchart or a piechart. If you use the extent-option only features that are contained in these extent are taken into account.

### Sample App ###
http://www.mapapps.de/mapapps/resources/apps/downloads_analysis_distribution/index.html

### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

##### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`

Installation Guide
------------------
- At first, you need to add the bundles "agssearch" and "dn_analysis_distribution" to your app.
- After that, add a MapServer to your app that got CodedValues (Content -> Services Management). Example
- Now you can add the new service to the Search&Selection bundle. (Search&Selection -> ArcGIS for Server Search&Selection)
- Finally change the default store in the Analysis/Distribution config and restart the app. (Tools -> Analysis/Distribution Config)
