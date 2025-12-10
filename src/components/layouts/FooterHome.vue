<template>
  <footer>
    <div class="container">
      <div class="row g-4 footer-nav">
        <div class="col-12 col-md-6 col-lg-3">
          <h5>Vintage</h5>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Advertising</a></li>
          </ul>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <h5>Discover</h5>
          <ul>
            <li><a href="#">How it Works</a></li>
            <li><a href="#">Help center</a></li>
            <li><a href="#">Infoboard</a></li>
            <li><a href="#">Mobile apps</a></li>
          </ul>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <h5>Help</h5>
          <ul>
            <li><a href="#">Help center</a></li>
            <li><a href="#">Buying</a></li>
            <li><a href="#">Trust & Safety</a></li>
          </ul>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <h5>Community</h5>
          <ul>
            <li><a href="#">Forum</a></li>
          </ul>
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-between">
        <div class="social-icons">
          <a href="#"><i class="fa-brands fa-whatsapp"></i></a>
          <a href="#"><i class="fa-brands fa-instagram"></i></a>
          <a href="#"><i class="fa-brands fa-linkedin"></i></a>
        </div>
        <p class="copyright-text">&copy; Vintage, {{ currentYear }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>