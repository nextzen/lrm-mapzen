---
layout: default
---

[Leaflet Routing Machine / GraphHopper](https://github.com/perliedman/lrm-graphhopper)
================================

Download prebuilt files:

<ul>
{% for version in site.data.versions reversed %}
  <li>
    <a href="{{site.baseurl}}/dist/lrm-graphhopper-{{ version.version }}.js">
      lrm-graphhopper-{{ version.version }}.js
    </a>
    (<a href="{{site.baseurl}}/dist/lrm-graphhopper-{{ version.version }}.min.js">
      lrm-graphhopper-{{ version.version }}.min.js
    </a>)
  </li>
{% endfor %}
</ul>

Just load one of these files with a `<script>` tag in your page, after
Leaflet and Leaflet Routing Machine has been loaded.

Or, to use with for example Browserify:

```sh
npm install --save lrm-graphhopper
```

See the [lrm-graphhopper project page](https://github.com/perliedman/lrm-graphhopper) for info 
and docs on using the plugin.
