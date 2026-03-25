<template>
  <div class="landing">
    <NavBar />

    <section class="hero">
      <div class="hero-image" :style="{ backgroundImage: `url(${heroImage})` }">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">CowBook</h1>
          <p class="hero-slogan">Пространство, где рождаются идеи</p>
        </div>
      </div>
    </section>

    <section class="description">
      <p class="description-text">
        CowBook — это современный коворкинг в центре города, созданный для комфортной работы,
        продуктивных встреч и творческого развития. Просторные зоны, мощный интернет,
        уютные лаунджи и полная инфраструктура для профессионалов и команд.
        Выберите своё идеальное рабочее место уже сегодня.
      </p>
    </section>

    <section class="vertical-gallery">
      <div class="gallery-grid">
        <div class="gallery-item" v-for="(photo, idx) in verticalPhotos" :key="idx">
          <img :src="photo" alt="Coworking vertical view" loading="lazy" />
        </div>
      </div>
    </section>

    <section class="booking-steps">
      <h2 class="section-title">Как забронировать?</h2>
      <div class="steps">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3>Зарегистрируйтесь</h3>
          <p>Создайте аккаунт за пару минут</p>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h3>Выберите время</h3>
          <p>Укажите дату и время посещения</p>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h3>Забронируйте</h3>
          <p>Выберите свободный стол и подтвердите бронь</p>
        </div>
        <div class="step-card">
          <div class="step-number">4</div>
          <h3>Приходите</h3>
          <p>Работайте в комфортной обстановке</p>
        </div>
      </div>
    </section>


    <section class="full-slogan">
      <h2>идеальный рабочий день начинается здесь</h2>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

// Импортируем локальные изображения
import heroBg from '@/assets/images/hero-bg.jpg'
import gallery1 from '@/assets/images/gallery-1.jpg'
import gallery2 from '@/assets/images/gallery-2.jpg'
import gallery3 from '@/assets/images/gallery-3.jpg'
import gallery4 from '@/assets/images/gallery-4.jpg'

const heroImage = heroBg

const verticalPhotos = [
  gallery1,
  gallery2,
  gallery3,
  gallery4
]
</script>

<style scoped>
.landing {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.hero {
  width: 100%;
  margin: 0;
  padding: 0;
}

.hero-image {
  position: relative;
  width: 100%;
  height: 85vh;
  min-height: 540px;
  background-size: cover;
  background-position: center 30%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 32px;
  margin: 0;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
  z-index: 1;
  border-radius: inherit;
}

.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  max-width: 800px;
  padding: 0 20px;
}

.hero-title {
  font-size: 80px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  line-height: 1.1;
}

.hero-slogan {
  font-size: 28px;
  font-weight: 500;
  opacity: 0.95;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.description {
  padding: 80px 20px 60px;
}

.description-text {
  max-width: 900px;
  margin: 0 auto;
  font-size: 20px;
  line-height: 1.6;
  text-align: center;
  font-weight: 400;
}

.vertical-gallery {
  padding: 40px 20px 80px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto;
}

.gallery-item {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 3 / 4;
}

.gallery-item:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.gallery-item:hover img {
  transform: scale(1.03);
}

/* ========== Booking Steps ========== */
.booking-steps {
  padding: 60px 20px 80px;
}

.section-title {
  max-width: 1280px;
  margin: 0 auto 56px;
  font-size: 42px;
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.01em;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 40px;
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}

.step-card {
  padding: 24px 16px;
  background: var(--bg-step);
  border-radius: 28px;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.step-number {
  width: 64px;
  height: 64px;
  background: var(--accent-color);
  color: white;
  font-size: 32px;
  font-weight: 700;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  transition: background 0.2s;
}

.step-card:hover .step-number {
  background: var(--accent-gold);
  color: var(--text-primary);
}

.step-card h3 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 12px;
}

.step-card p {
  font-size: 16px;
  line-height: 1.4;
}

/* ========== Slogan ========== */
.full-slogan {
  padding: 100px 20px;
  text-align: center;
}

.full-slogan h2 {
  max-width: 1100px;
  margin: 0 auto;
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-transform: uppercase;
}

/* ========== Responsive ========== */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 64px;
  }
  .hero-slogan {
    font-size: 24px;
  }
  .section-title {
    font-size: 36px;
  }
  .full-slogan h2 {
    font-size: 44px;
  }
}

@media (max-width: 768px) {
  .hero-image {
    height: 70vh;
    min-height: 480px;
    border-radius: 24px;
  }
  .hero-title {
    font-size: 44px;
  }
  .hero-slogan {
    font-size: 18px;
  }
  .description {
    padding: 48px 20px 40px;
  }
  .description-text {
    font-size: 18px;
    text-align: left;
  }
  .gallery-grid {
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  .section-title {
    font-size: 32px;
    margin-bottom: 40px;
  }
  .steps {
    gap: 24px;
  }
  .step-card h3 {
    font-size: 20px;
  }
  .full-slogan {
    padding: 64px 20px;
  }
  .full-slogan h2 {
    font-size: 32px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 32px;
  }
  .hero-slogan {
    font-size: 16px;
  }
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .gallery-item {
    aspect-ratio: 4 / 5;
  }
  .step-number {
    width: 52px;
    height: 52px;
    font-size: 26px;
  }
}
</style>