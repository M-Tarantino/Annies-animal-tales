---
layout: default
title: Kindergeschichten
description: Zauberhafte Geschichten speziell für die Kleinsten
permalink: /kindergeschichten/
---

<section class="stories-hero">
  <h1>✨ Kindergeschichten</h1>
  <p class="stories-subtitle">Zauberhafte Geschichten speziell für die Kleinsten — zum Lachen, Träumen und Lernen.</p>
</section>

{% if site.kindergeschichten.size > 0 %}
<div class="stories-grid">
  {% for story in site.kindergeschichten %}
    <article class="story-card">
      {% if story.image %}<div class="story-card-image"><img src="{{ story.image }}" alt="{{ story.title }}" loading="lazy"></div>{% endif %}
      <div class="story-card-content">
        <h2><a href="{{ story.url }}">{{ story.title }}</a></h2>
        <div class="story-card-meta">
          <time>{{ story.date | date: "%d.%m.%Y" }}</time>
          {% if story.age_group %}<span class="age-badge">{{ story.age_group }}</span>{% endif %}
          {% if story.reading_time %}<span>📖 {{ story.reading_time }} min</span>{% endif %}
        </div>
        <p>{{ story.description }}</p>
        <a href="{{ story.url }}" class="story-link">Zur Geschichte →</a>
      </div>
    </article>
  {% endfor %}
</div>
{% else %}
<div style="text-align: center; padding: 3rem; background: white; border-radius: 12px;">
  <p>✨ Noch keine Kindergeschichten. Das erste Abenteuer kommt bald! 🐾</p>
</div>
{% endif %}
