# a simple script to update the data for visualization and push to the github repo
cd /Users/Nick/dataProjects/d3Stuff/whereDaFiresAt/

# first we download
curl -o data/fires.csv https://firms.modaps.eosdis.nasa.gov/active_fire/text/USA_contiguous_and_Hawaii_48h.csv

# now we add commit and push to gh-pages
git add --all :/
git commit -m  "automatic data update"
git push origin gh-pages