# GDP Growth Rate Data Visualization

### Overview

This is a web application written in JavaScript using D3.js library to visualize the GDP growth rate of ten countries and one world average rate for the past 50 years. Data is obtained from World Development Indicators on [The World Bank](https://datacatalog.worldbank.org/dataset/world-development-indicators), dates for data range from 1969 to 2018. This web application visualizes the GDP growth rating for each country as well as provides comparision between two countries/ selected entries. User can also select a specific range of date to show the details of the visualized graph. 

A demo video clip can be found [here](<https://youtu.be/EQELsmCBFyA>). 

### UI Design

There are 3 components: Canvas, on the top-left part of the windows; Legend, on the top-right part and Slider, on the downmost.

![](https://github.com/Artlands/Viz_project1/blob/master/img/ui.png)

#### Canvas

The labels of axises will be automatically changed according to the GDP growth rate and user-defined date range, dashed lines are added to increase the readability. 

#### Legend

10 Different colors are assigned to these 10 countries. When user hovers the mouse on the small rectangular besides the country name, the color will show up. If there are two entries selected, a "comparison " button will show up under the world legend to indiciate that user can apply comparison to these two entries. It will be disabled (hide) if more than two entries are selected.

#### Slider

The Slider provides an interface for user to select specific range of date of GDP growth rate, i.e. zooming into a time interval. By dragging  the mouse on the slider, it will select the time interval; By releasing the mouse, the start point and end point will stick to its nearest year. The user clicks outside of the selected rectangular to unselect the time interval.

#### Tooltip

A tooltip will show up when user hovers the mouse on the plotted line, it presents the GDP growth rate of the nearest year. If there are several lines plotted at the same time, the hovered line will be under highlight.

![](https://github.com/Artlands/Viz_project1/blob/master/img/tooltip.png)

#### Comparision

When Comparision button is clicked, a comparison will be applied to the selected two entries. The positive and negative differences between the compared features are emphasized by colored areas above and below the original entry's line.

![](https://github.com/Artlands/Viz_project1/blob/master/img/cmp.png)

#### Night model

User can click the country names to switch between the night model and day model. The day model is set as default.

![](https://github.com/Artlands/Viz_project1/blob/master/img/night.png)

### Notable Data Characteristics

After implementing the application and plotting the data, I find some characteristics of the data that are described below.

#### The GDP Growth of Saudi Arabia in 1970 was extremely high

From the visualization, it is obvious that the GDP growth of Saudi Arabia in 1970 is up to 58.65% comparing to the world average 3.89%. This can be attributed to the country has been the world's largest crude-oil exporter since 1970. Details can be found [here]( https://fanack.com/saudi-arabia/economy/).

![](https://github.com/Artlands/Viz_project1/blob/master/img/saudi.png)

#### The 2008-2009 Financial Crisis affected almost every country

Another obvious finding from the visualized date is the Financial Crisis occurred during 2008-2009 affected most countries' GDP growth except China and India. The most severe effect was happened in Russian, which caused the GDP growth rate down to -7.81%. More info about 08/09 Financial Crisis can be found [here]( https://www.thebalance.com/2008-financial-crisis-3305679).

![](https://github.com/Artlands/Viz_project1/blob/master/img/fincirs_copy.png)