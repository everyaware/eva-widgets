# EveryAware Widgets
In the repository we collect widgets for the [**Gears**](http://cs.everyaware.eu/event/gears) module of the [EveryAware platform](http://cs.everyaware.eu).
The Gears module allows to visualize, explore, and analyze the data collected using our generic data API.
We will include several advanced widgets as well as a variety of tutorials which show you how to write your own widgets.

## Loading widgets in Gears
For managing your loaded widget types go to the **Widgets** tab in Gears. There
you can either remove loaded widget types or add new ones by URL. The URL has to
point to a folder that contains at least the **widget.js** and **meta.js** files.
You can also load a widget type directly from a github repository but you have
to use a service like [**rawgit.com**](https://rawgit.com) in order to have
correct Content-Type headers since github always specifies all files as
'text/html'.

Example: Loading the **helloworld** widget type from github
1. Find the URL to the folder that contains the **widget.js** and **meta.js**
   files (here: https://github.com/everyaware/eva-widgets/blob/master/tutorial/helloworld)
2. Go to https://rawgit.com and enter that URL
3. Copy the new URL that rawgit generated (here: https://rawgit.com/everyaware/eva-widgets/master/tutorial/helloworld or https://cdn.rawgit.com/everyaware/eva-widgets/6e2a8b1f/tutorial/helloworld)
4. Enter URL in Gears' Widgets tab
