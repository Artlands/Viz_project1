# GDP Growth Rate Data Visualization

### Overview

This is a web application written in JavaScript using D3.js library to visualize the GDP growth rate of ten countries and one world average rate for the last 50 years. Data is obtained from World Development Indicators on The Wrold Bank (https://datacatalog.worldbank.org/dataset/world-development-indicators), dates for data range from 1969 to 2018. This web application visualizes the GDP growth rating for each country as well as provides comparision between two countries/ selected entries. User can also select a specific range of date to show the details of the visualized graph. 

A presentation video clip can be found here. 

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