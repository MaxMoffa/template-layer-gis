<script>
  import { Button, Icon } from 'svelte-materialify/src';
  import { goto, metatags } from '@roxi/routify';
  import { mdiHome, mdiChevronLeft, mdiEmail } from '@mdi/js';

  // Tab title
  $metatags.title = "Ops!";

</script>

<!-- Main container -->
<main>

  <!-- Content -->
  <div class="pl-6 pr-6">

      <!-- Image -->
      <div class="img pb-16">
          <img src="./media/grape_pack/drawkit-grape-pack-illustration-7.svg" alt="Error">
      </div>

      <!-- Message -->
      <h4 class="text-h4 text-center pb-2">
        Page not found
      </h4>

      <!-- Suggestions -->
      <div class="text-subtitle-1 text-center pb-6">
        Check if the url in the address bar is correct otherwise contact us using the button below
      </div>

      <!-- Actions -->
      <div class="button d-flex justify-center">

        <!-- Return back -->
        <Button depressed rounded class="primary-color white-text" on:click={() => window.open(window.location.origin, "_self")}>
          <Icon path={mdiChevronLeft} class="mr-3" />
          Go back
        </Button>

        <!-- Go to home -->
        <!-- <Button depressed rounded outlined class="primary-color-text ml-2" on:click={() => $goto('/')}>
          <Icon path={mdiHome} class="mr-3" />
          Go home
        </Button> -->

        <!-- Contact button -->
        <Button depressed rounded outlined class="accent-text ml-2" on:click={() => window.open("mailto:bug@sensesquare.eu")}>
          <Icon path={mdiEmail} class="mr-3" />
          Contact us
        </Button>

      </div>

  </div>

</main>

<style>

  main {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      user-select: none;
  }

  main > div {
      width: 90%;
      height: 90%;
      max-width: 600px;
      max-height: 600px;
      display: flex;
      flex-direction: column;
  }

  main > div > .img {
      flex: 1;
      display: grid;
      place-items: center;
  }

  main > div > .img > img {
      width: 70%;
  }

  main > div > .button {
      flex: 1;
      max-height: 32px;
  }

</style>