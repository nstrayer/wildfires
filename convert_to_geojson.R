setwd("/Users/207439/Desktop/wildfires")
# install.packages("rgdal", type = "source")
# install.packages("rgeos", type = "source")
# install.packages("geojsonio")
# install.packages("ggmap")

library(geojsonio)
library(rgdal)
library(geojsonio)
library(jsonlite)
library(ggplot2)
library(ggmap)
library(dplyr)

# d <- read.csv("data/fires.csv") %>%
#   select(latitude, longitude, frp, brightness, acq_date, confidence) %>%
#   filter(confidence > 0.8)

d <- read.csv("data/seven_day_data.csv", stringsAsFactors = F) %>%
  select(latitude, longitude, bright_ti4, acq_date, confidence) %>%
  mutate(date = as.Date(acq_date, "%Y-%m-%d"))  %>%
  filter(confidence == "nominal" & date >= "2016-06-23" & date <= "2016-06-28") 

#where to center the map.
myLocation <- c(-118.5, 35.48, -118.2, 35.62)

myMap <- get_map(location=myLocation,color = "bw",
                 source="stamen", maptype="terrain", crop=FALSE)


#Using our developed contours. 
ggmap(myMap) +  
  stat_density_2d(data = d, aes(x = longitude, y = latitude,fill = ..level..), 
                  geom="polygon", alpha = 0.6) + 
  scale_fill_gradient(low = "#ffeda0", high = "#f03b20") + facet_wrap(~date)+
  theme(axis.title.y=element_blank(),axis.text.y=element_blank(),
        axis.ticks.y=element_blank(),
        axis.title.x=element_blank(),axis.text.x=element_blank(),
        axis.ticks.x=element_blank())


#Using the USGS perims
setwd("/Users/207439/Desktop/wildfires/data/ca_erskine_20160624_2101_dd83")
shpData <- readOGR(dsn=".", layer="ca_erskine_20160624_2101_dd83")
proj4string(shpData) <- CRS("+proj=longlat +ellps=WGS84")  # set coord sys
# to change to correct projection:
shpData <- spTransform(shpData, CRS("+proj=longlat +datum=WGS84")) 



ggmap(myMap) +  geom_polygon(aes(x = long, y = lat, group=group),
                             data = shpData, color ="white", fill ="orangered4",
                             alpha = .4, size = .2) +
  labs(title = "2016-06-27")

