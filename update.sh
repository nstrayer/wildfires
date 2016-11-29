# a simple script to update the data for visualization and push to the github repo
#cd /home/pi/scriptsToRun/wildfires
#cd /Users/Nick/dataProjects/d3Stuff/wildfires
cd /Users/207439/dev/wildfires

# first we download
# curl -o data/fires.csv https://firms.modaps.eosdis.nasa.gov/active_fire/text/USA_contiguous_and_Hawaii_48h.csv -k
curl -o data/fires.csv https://firms.modaps.eosdis.nasa.gov/active_fire/c6/text/MODIS_C6_USA_contiguous_and_Hawaii_48h.csv -k

# now we add commit and push to gh-pages
git add --all :/
git commit -m  "automatic data update"
git push origin gh-pages
