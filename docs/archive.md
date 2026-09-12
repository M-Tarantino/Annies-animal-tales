---
layout: default
title: Blog Archiv
permalink: /archive/
---

# 📚 Blog Archiv

{% if site.posts.size > 0 %}
<div class="archive-list">
  {% for post in site.posts %}
    <div class="archive-item">
      <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
      <time class="archive-date">{{ post.date | date: "%d.%m.%Y" }}</time>
    </div>
  {% endfor %}
</div>
{% else %}
<p>Noch keine Beiträge vorhanden.</p>
{% endif %}
