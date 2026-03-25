<template>
  <footer class="footer">
    <p>Работаем 24/7 без выходных</p>
    <p class="copyright">© 2026 CowBook. Все права защищены.</p>
  </footer>
</template>

<style scoped>
.footer {
  text-align: center;
  padding: 48px 20px;
  margin: 0 20px 20px 20px;
  border-radius: 32px;
  transition: all 0.3s ease;
}

/* Светлая тема */
.footer {
  background: #0a0a0a;
  color: #c0c0c0;
}

.footer .copyright {
  color: #6c6c6c;
}

/* Тёмная тема */
:root.dark .footer {
  background: var(--bg-card);
  color: var(--text-muted);
}

:root.dark .footer .copyright {
  color: var(--text-muted);
  opacity: 0.7;
}

.footer p {
  margin-bottom: 12px;
  font-size: 16px;
}

.footer .copyright {
  font-size: 14px;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .footer {
    margin: 0 16px 20px 16px;
    padding: 40px 16px;
    border-radius: 24px;
  }
}

@media (max-width: 480px) {
  .footer {
    margin: 0 12px 16px 12px;
    padding: 32px 16px;
    border-radius: 20px;
  }
}
</style>