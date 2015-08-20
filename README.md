# Analysis / Distribution
The Analysis / Distribution Bundle allows you to count features and display the results in charts. 

It searches for feature types in a defined AGSStore that got coded values and creates one tab with charts for all of them. Every coded value will be counted and displayed in these charts. You can decide: either you use a columnchart or a piechart. If you use the extent-option only features that are contained in these extent are counted.

Sample App: http://www.mapapps.de/mapapps/resources/apps/downloads_analysis_distribution/index.html

Installation Guide
------------------
- At first, you need to add the bundles "agssearch" and "dn_analysis_distribution" to your app.
- After that, add a MapServer to your app that got CodedValues (Content -> Services Management). Example
- Now you can add the new service to the Search&Selection bundle. (Search&Selection -> ArcGIS for Server Search&Selection)
- Finally change the default store in the Analysis/Distribution config and restart the app. (Tools -> Analysis/Distribution Config)
