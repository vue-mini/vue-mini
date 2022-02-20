<template>
  <div class="theme" :class="pageClasses">
    <div class="banner">请考虑<a href="/guide/sponsor.html">赞助作者</a>！</div>

    <NavBar v-if="showNavbar" @toggle="toggleSidebar" />

    <SideBar :open="openSideBar">
      <template #sidebar-top>
        <slot name="sidebar-top" />
      </template>
      <template #sidebar-bottom>
        <slot name="sidebar-bottom" />
      </template>
    </SideBar>
    <!-- TODO: make this button accessible -->
    <div class="sidebar-mask" @click="toggleSidebar(false)" />

    <Content v-if="isCustomLayout" />

    <Home v-else-if="enableHome">
      <template #hero>
        <slot name="home-hero" />
      </template>
      <template #features>
        <slot name="home-features" />
      </template>
      <template #footer>
        <slot name="home-footer" />
      </template>
    </Home>

    <Page v-else>
      <template #top>
        <slot name="page-top-ads">
          <div id="ads-container">
            <div class="wwads-cn wwads-horizontal" data-id="81" />
          </div>
        </slot>
        <slot name="page-top" />
      </template>
      <template #bottom>
        <slot name="page-bottom" />
      </template>
    </Page>
  </div>

  <Debug />
</template>

<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useRoute, useData } from 'vitepress/dist/client'
import {
  isSideBarEmpty,
  getSideBarConfig,
} from 'vitepress/dist/client/theme-default/support/sideBar'

// components
import NavBar from 'vitepress/dist/client/theme-default/components/NavBar.vue'
import SideBar from 'vitepress/dist/client/theme-default/components/SideBar.vue'
import Page from 'vitepress/dist/client/theme-default/components/Page.vue'

const Home = defineAsyncComponent(
  () => import('vitepress/dist/client/theme-default/components/Home.vue')
)

// generic state
const route = useRoute()
const { site, theme, frontmatter } = useData()

// custom layout
const isCustomLayout = computed(() => !!frontmatter.value.customLayout)
// home
const enableHome = computed(() => !!frontmatter.value.home)

// navbar
const showNavbar = computed(() => {
  const themeConfig = theme.value
  if (frontmatter.value.navbar === false || themeConfig.navbar === false) {
    return false
  }
  return (
    site.value.title || themeConfig.logo || themeConfig.repo || themeConfig.nav
  )
})

// sidebar
const openSideBar = ref(false)

const showSidebar = computed(() => {
  if (frontmatter.value.home || frontmatter.value.sidebar === false) {
    return false
  }

  return !isSideBarEmpty(
    getSideBarConfig(theme.value.sidebar, route.data.relativePath)
  )
})

const toggleSidebar = (to?: boolean) => {
  openSideBar.value = typeof to === 'boolean' ? to : !openSideBar.value
}

const hideSidebar = toggleSidebar.bind(null, false)
// close the sidebar when navigating to a different location
watch(route, hideSidebar)
// TODO: route only changes when the pathname changes
// listening to hashchange does nothing because it's prevented in router

// page classes
const pageClasses = computed(() => {
  return [
    {
      'no-navbar': !showNavbar.value,
      'sidebar-open': openSideBar.value,
      'no-sidebar': !showSidebar.value,
    },
  ]
})
</script>

<style>
#app {
  padding-top: 24px;
}

.theme .nav-bar {
  top: 24px;
}

.banner {
  position: fixed;
  z-index: var(--z-index-navbar);
  top: 0;
  left: 0;
  right: 0;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background-color: var(--c-brand);
}

.banner a {
  color: #fff;
  text-decoration: underline;
}

#ads-container {
  margin: 0 auto;
}

@media (min-width: 421px) {
  #ads-container {
    float: right;
    margin: -20px -1.5rem 1rem 1rem;
    width: 150px;
  }
}

@media (max-width: 420px) {
  #ads-container {
    margin: 1.75rem 0;
  }
}

@media (min-width: 1400px) {
  #ads-container {
    position: fixed;
    right: 1.5rem;
    bottom: 1rem;
  }
}

.qrcode {
  display: flex;
  justify-content: space-between;
}

.qrcode img {
  width: 40%;
}

@media (max-width: 420px) {
  .qrcode {
    flex-direction: column;
  }

  .qrcode img {
    width: 100%;
  }

  .qrcode img + img {
    margin-top: 1rem;
  }
}
</style>
