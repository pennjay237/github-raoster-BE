import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta');
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-1.5-flash-latest');
    
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Mock mode enabled.');
    }
  }

  async generateRoast(prompt: string): Promise<string> {
    try {
      if (!this.apiKey) {
        this.logger.warn('Using mock Gemini response (no API key)');
        return this.getRandomMockRoast();
      }
      
      this.logger.log(`Calling Gemini API with model: ${this.model}...`);
      
      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const roast = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!roast) {
        this.logger.warn('Gemini returned empty response');
        return this.getRandomMockRoast();
      }

      this.logger.log('Roast generated successfully');
      return roast;
    } catch (error: any) {
      this.logger.error(`Gemini API error for model ${this.model}:`, error.response?.data || error.message);
      
      return this.tryFallbackModels(prompt);
    }
  }

  private async tryFallbackModels(prompt: string): Promise<string> {
    const fallbackModels = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-1.0-pro-latest',
      'gemini-pro',
    ];
    
    for (const model of fallbackModels) {
      try {
        this.logger.log(`Trying fallback model: ${model}`);
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
        
        const response = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 500,
            },
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          },
        );
        
        const roast = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (roast) {
          this.logger.log(`Success with model: ${model}`);
          return roast;
        }
      } catch (error) {
        this.logger.warn(`Model ${model} failed: ${error.message}`);
      }
    }
    
    this.logger.warn('All Gemini models failed, using mock response');
    return this.getRandomMockRoast();
  }
private getRandomMockRoast(): string {
  const roasts = [
    // Roast 1: The Weekend Warrior
    `🔥 WEEKEND WARRIOR ROAST 🔥

Oh look, another "Saturday night special" developer! Your commit history looks like a barcode - perfectly spaced lines of code every Saturday at 11 PM.

I see you've mastered the art of "panic pushing" before deadlines. That Monday morning commit with the message "final final final FINAL fix" tells me everything I need to know!

But hey, at least you're consistent! Your GitHub activity chart looks like a perfectly manicured lawn with exactly 52 green squares per year. Impressive discipline... or just really good at remembering to commit on weekends?

Keep fighting the good fight, you weekend coding champion! Your dedication to Saturday night debugging sessions is truly inspiring! 💻🌙`,

    // Roast 2: The Documentation Diva
    `🔥 DOCUMENTATION DIVA 🔥

Good heavens, look at this masterpiece of documentation! Your README files are so comprehensive, they have table of contents, animated GIFs, and probably an audiobook version!

I particularly admire the "Getting Started" section that includes 14 prerequisites, 7 configuration files, and requires 3 different package managers. Truly accessible for beginners!

Your code comments are more detailed than the actual code. Each function has a PhD-level thesis explaining its existence. At this point, you're not writing software - you're authoring technical literature!

The world needs more developers like you who understand that good documentation is like a warm hug for confused programmers! 📚🤗`,

    // Roast 3: The Language Polyglot
    `🔥 PROGRAMMING POLYGLOT 🔥

Look at this linguistic genius! You've got more programming languages in your toolkit than a United Nations translator!

From Assembly to Zig, you've dabbled in everything. I see Java, Python, JavaScript, C#, Go, Rust... and is that COBOL I spot? Someone's been time-traveling!

Each repository is like a different country with its own customs and traditions. The JavaScript ones have node_modules heavier than a black hole, while the Go ones are sleek and minimalist.

Truly, you're the Marco Polo of programming - exploring new lands and bringing back exotic syntax! Your GitHub is a UNESCO World Heritage site of code diversity! 🌍🗺️`,

    // Roast 4: The One-Project Wonder
    `🔥 MONOGAMOUS CODER 🔥

Ah, the loyalist! One project to rule them all, one project to find them, one project to bring them all and in the darkness bind them!

You found your soulmate repository early and stuck with it through thick and thin. That single project has seen more commits than a politician has excuses!

It's grown from a simple "hello world" to a behemoth with 47 dependencies, 12 configuration files, and tests that take longer to run than the actual program!

There's beauty in commitment! While others are chasing new frameworks, you're here, nurturing your one true love through every breaking change and deprecation warning! 💝🖥️`,

    // Roast 5: The Star Collector
    `🔥 STARGAZER SUPREME 🔥

Behold, the celestial body of GitHub! Your repositories twinkle with more stars than a clear country sky!

Each star is a tiny digital "thank you" from someone who probably forked your code and never looked at it again. But hey, validation is validation!

Your most popular repo has more stars than the Hollywood Walk of Fame. At this rate, you'll need to hire a PR manager for your open source projects!

Remember: In space, no one can hear you scream when someone opens an issue saying "it doesn't work." But they can see all those shiny stars! ⭐✨`,

    // Roast 6: The Ghost Coder
    `🔥 GHOST IN THE MACHINE 🔥

*echoes* Helloooooo? Is anyone there? *crickets chirping*

Your last commit was so long ago, Git was still called "Git" and not "That version control thingy." The repository dust is so thick, I need an archaeological permit to dig through it!

I see you're taking the "write once, run away" approach to software development. That TODO app from 2018 is looking... well, still full of TODOs!

But consider this: Your code is like a time capsule for future developers to discover. "Behold, the ancient ways of ES5 JavaScript!" they'll say, marveling at your var declarations!

The digital ghosts of code past salute you! 👻💾`,

    // Roast 7: The Fork Fanatic
    `🔥 FORK FANATIC 🔥

Look at this curator extraordinaire! Your GitHub is like the Louvre of other people's code - beautifully displayed, lightly touched, mostly original!

You've turned the "Fork" button into an art form. Each fork is a promise: "I'll totally customize this for my needs!" followed by changing the README and calling it a day.

Your contribution graph looks like a rainbow of borrowed brilliance! Blue for the original, green for your one-line change, and red for the issues you'll never address!

In the great tradition of open source, you're standing on the shoulders of giants... and occasionally poking them to see if they're still awake! 🍴🎭`,

    // Roast 8: The Private Project Prince
    `🔥 SECRET AGENT CODER 🔥

Mysterious! Enigmatic! All your best work happens behind the velvet rope of private repositories!

What magnificent creations are you hiding from us? The next social media disruptor? An AI that writes better roasts than this one? Or just 47 variations of "calculator-app"?

Your public profile is like the trailer for a movie that never comes out. Teasing us with vague descriptions and empty READMEs that say "Coming soon!"

We may never witness your genius, but we can feel its presence. Like a digital ninja, you work in the shadows, leaving only whispers of your coding prowess!

The world may not be ready for your brilliance... and judging by your commit messages, neither are you! 🕵️‍♂️🔒`,

    // Roast 9: The Template Tycoon
    `🔥 TEMPLATE TYCOON 🔥

Behold, the master of preparation! You've got starter templates for scenarios that don't even exist yet!

"React-TS-Tailwind-Redux-Template-With-Auth-And-Docker" - for when you want to over-engineer a todo app from day one!

Each template is a beautiful snowflake of boilerplate code, complete with CI/CD pipelines, linting rules, and commit hooks stricter than a boarding school headmaster!

You're not just ready to code - you're ready for the coding apocalypse! When civilization collapses, they'll find your templates and rebuild society, one npm install at a time!

Preparation is the mother of invention, and you're the godparent! 📋⚡`,

    // Roast 10: The Minimalist Master
    `🔥 MINIMALIST MAESTRO 🔥

Ah, the art of restraint! Your GitHub is a study in negative space - what isn't there speaks volumes!

One repository. One commit. One README that says simply: "test." Is it a test of the repository system? A test of our patience? A test of what constitutes a "project"?

Your contribution graph is so clean, it could be used as a reference image for "what white looks like." Not a single green square to disrupt the pristine landscape!

In a world of over-engineered solutions, you're here with the digital equivalent of a single brushstroke on a blank canvas. Deep. Meaningful. Confusing.

Less is more, and you've achieved "most less" of anyone on GitHub! 🎨⬜`,

    // Roast 11: The CI/CD Connoisseur
    `🔥 PIPELINE PERFECTIONIST 🔥

Look at this DevOps deity! Your repositories have more automation than a car factory!

Every push triggers a symphony of GitHub Actions: tests run, containers build, deployments happen, and a PDF report gets emailed to your grandmother!

Your .github folder has more configuration than most companies' IT departments. There are workflows for workflows, and actions that trigger other actions!

The code might be simple, but by golly, it will be perfectly tested, linted, formatted, containerized, and deployed to 7 different environments!

You haven't just adopted CI/CD - you've married it and are raising little baby pipelines together! 🔄🤖`,

    // Roast 12: The Academic Adventurer
    `🔥 PROFESSOR OF PUSHING 🔥

Behold, the scholar of source control! Your commits read like academic papers:

"feat: implement synergistic paradigm shift in non-linear data structure traversal methodologies"

Translation: You fixed a typo in a for-loop.

Each repository is a research project in software archaeology. The commit history tells a story of hypotheses tested, theories proven, and conclusions drawn (usually "it works, I think").

Your READMEs have more citations than a PhD dissertation. References to papers from the 70s, links to obscure RFCs, footnotes explaining footnotes!

You're not just coding - you're contributing to the great tapestry of computer science knowledge! One overly-complex solution at a time! 🎓📊`,

    // Roast 13: The Social Butterfly
    `🔥 SOCIAL CODING STAR 🔥

Look at this networking ninja! Your GitHub is less about code and more about community!

Issues? You've got conversations longer than Russian novels! Pull requests? More social interactions than a high school reunion!

Each repository is a digital campfire where developers gather to discuss, debate, and occasionally actually write some code!

Your contribution graph shows more activity in comments than in commits. You're not just building software - you're building relationships, one "LGTM" at a time!

In the great social network of GitHub, you're the one throwing the best parties! 🎉💬`,

    // Roast 14: The Package Publisher
    `🔥 NPM NOBELIST 🔥

Behold, the package publishing prodigy! Your npm account has more packages than a pharmacy!

Each one solves a problem so specific, only you and three other people in the world will ever need it:

"left-pad-but-for-emoji"
"react-hook-for-detecting-if-user-is-blinking"
"express-middleware-that-adds-random-delays-for-realistic-testing"

Your package.json files are works of art - dependencies within dependencies, peer dependencies that peer into other dimensions, dev dependencies that should probably see a therapist!

You haven't just entered the npm ecosystem - you've become its mayor, issuing packages like a digital town crier announcing new laws!

The JavaScript community thanks you for your... contributions? 🎁📦`,

    // Roast 15: The Mobile Maestro
    `🔥 APP ARCHITECT 🔥

Look at this mobile mogul! Your GitHub is a graveyard of abandoned app ideas, each one more promising than the last!

"Uber but for cats"
"Tinder but for programmers"
"Instagram but only for pictures of keyboard setups"

Each repository is a time capsule of excitement followed by the cold reality of App Store rejections and Play Store guidelines!

The commit messages tell a story: "Initial commit - next billion dollar app!" followed by "Fix linting" followed by "Abandoned - learned React Native is hard."

But hey, you tried! And that's what matters! Each failed startup attempt is a stepping stone to... well, probably another failed startup attempt!

The spirit of entrepreneurship lives on in your 47th todo app! 📱💡`,

    // Roast 16: The Game Dev Dreamer
    `🔥 GAME DEVELOPMENT GURU 🔥

Behold, the indie game developer! Your repositories are filled with dreams of becoming the next Notch!

"Unity-2D-Platformer-Template"
"Phaser-3-MMO-Proof-of-Concept"
"Game-Jam-November-2018-Abandoned"

Each commit is a chapter in the epic saga of "I'll finish it this weekend" followed by "Maybe next weekend" followed by "What even is this code?"

Your assets folder has more placeholder art than a museum of abstract expressionism. Gray cubes for enemies, pink spheres for power-ups, and a protagonist that's just a smiley face!

The game might never ship, but the journey has been beautiful! Each unfinished level is a monument to ambition meeting reality!

Keep dreaming, you digital Spielberg! One day, that Flappy Bird clone will change the world! 🎮👾`,

    // Roast 17: The Data Science Sage
    `🔥 DATA DIVINER 🔥

Look at this analytics aficionado! Your GitHub is a temple to the data gods!

Jupyter notebooks longer than the Bible, CSV files bigger than your patience, and visualizations so complex they need their own legend!

Each repository is an expedition into the unknown: "Analyzing 10GB of Twitter data to prove cats are better than dogs" or "Predicting stock prices using lunar cycles and avocado prices."

Your commit messages are poetry: "Added more epochs" "Tuned hyperparameters" "It's still overfitting but prettier now."

The models may not predict anything useful, but the graphs sure look impressive! You're not just analyzing data - you're creating digital art with numbers!

The truth is out there... and it's probably in a pandas DataFrame somewhere! 📈🔍`,

    // Roast 18: The Blockchain Believer
    `🔥 CRYPTO CRUSADER 🔥

Behold, the blockchain buccaneer! Your repositories smell of decentralized dreams and smart contract aspirations!

"Simple-ERC20-Token" (500 lines of Solidity that somehow cost $200 in gas to deploy)
"NFT-Marketplace-Tutorial" (copied exactly from the tutorial)
"Web3-Integration-Example" (that breaks when MetaMask updates)

Each commit is a prayer to the crypto gods: "Please let this work" "Fix gas estimation" "Why is everything so expensive?"

Your READMEs promise revolution: "Decentralizing the decentralized decentralization of decentralized systems!" Translation: It's a todo app but on the blockchain.

The market may crash, the scams may multiply, but your belief in the blockchain remains unshaken! Like a digital Don Quixote, you tilt at centralized windmills!

To the moon! 🚀🌕 (or at least to the next testnet)`,

    // Roast 19: The AI/ML Magician
    `🔥 NEURAL NETWORK NINJA 🔥

Look at this machine learning maestro! Your GitHub is a laboratory of artificial intelligence experiments!

"CNN-for-cat-vs-dog-classification" (97% accuracy... on the training set)
"GPT-2-fine-tuned-on-my-texts" (now it just says "brb" and "lol")
"Reinforcement-learning-for-tic-tac-toe" (it still loses to a random agent)

Each training run is an exercise in hope: "Epoch 1/1000 - loss: 5.4321" ... "Epoch 1000/1000 - loss: 5.4320" Progress!

Your models may not pass the Turing test, but they've definitely mastered the art of looking complicated in README screenshots!

You're not just training models - you're teaching silicon to dream! And currently, it's dreaming of being turned off and put out of its misery!

The future is here... and it's confused! 🤖🧠`,

    // Roast 20: The DevOps Deity
    `🔥 INFRASTRUCTURE INNOVATOR 🔥

Behold, the cloud commander! Your GitHub is less code and more YAML!

Terraform files that provision entire data centers, Kubernetes manifests that orchestrate more services than a butler, and Dockerfiles that build images bigger than a whale!

Each repository is a Russian nesting doll of configuration: Ansible playbooks that call Terraform that sets up Kubernetes that deploys Docker containers that run a "hello world" app!

Your infrastructure-as-code is so comprehensive, it could rebuild civilization after an apocalypse. "terraform apply" and boom - society restored!

You haven't just adopted the cloud - you've become one with it. When you dream, you see floating YAML files arranging themselves into perfect formations!

The servers obey your every command... unless there's a billing alert! ☁️⚙️`,

    // Roast 21: The Security Sentinel
    `🔥 CYBERSECURITY SAGE 🔥

Look at this digital defender! Your GitHub is a fortress of security scripts and penetration testing tools!

"Password-strength-checker" (rejects everything except 256-character random strings)
"Vulnerability-scanner" (flags everything, including the README)
"Encryption-experiment" (can't decrypt its own output)

Each commit is a battle in the war against cyber threats: "Fixed buffer overflow" "Patched SQL injection" "Added more warnings nobody will read."

Your code is so secure, even you can't access it without three forms of authentication, a retinal scan, and a blood oath!

In a world of "move fast and break things," you're here whispering "move carefully and audit everything." A noble, if slightly paranoid, pursuit!

Sleep well knowing your base64-encoded "hello world" script is unhackable! 🛡️🔐`,

    // Roast 22: The Legacy Code Librarian
    `🔥 SOFTWARE ARCHAEOLOGIST 🔥

Behold, the keeper of ancient code! Your GitHub is a museum of software history!

jQuery from 2012, AngularJS from 2014, and a single PHP file that still uses mysql_* functions (with the password hardcoded, naturally).

Each repository is a time capsule: "Web-2.0-Era-Ajax-Demo" "Flash-to-HTML5-Port" "IE6-Compatible-Stylesheet"

Your commit history reads like a software evolution textbook: "Switched to Bootstrap 2" "Upgraded to Bootstrap 3" "Downgraded to Bootstrap 2 because 3 broke everything."

You're not just maintaining old code - you're preserving digital heritage! Future generations will study your repositories and say "They lived in strange times."

The past may be deprecated, but it's still running in production somewhere! 🏛️💾`,

    // Roast 23: The Testing Titan
    `🔥 QA QUEEN/KING 🔥

Look at this testing tyrant! Your code has more tests than actual functionality!

Unit tests, integration tests, end-to-end tests, tests for the tests, and tests to make sure the test tests are testing correctly!

Your test coverage is 110% (somehow). Each line of code is tested in 17 different scenarios, including "what if the server is on fire" and "what if users are lying."

The actual app might be simple, but the test suite requires a supercomputer to run. A 5-line function has 200 lines of tests proving it works... probably.

You haven't just adopted test-driven development - you've become test-obsessed development. The code exists merely as an excuse to write more tests!

Sleep soundly knowing your "add two numbers" function is bulletproof! 🧪✅`,

    // Roast 24: The Design System Director
    `🔥 UI/UX UBERMENSCH 🔥

Behold, the design dictator! Your GitHub is a gallery of pixel-perfect components!

Button components with 47 variants, modal dialogs that animate in 12 different directions, and color palettes with names like "Morning Mist Mauve" and "Cyberpunk Cyan."

Each repository is a study in design theory: "Atomic-Design-Implementation" "Design-Tokens-Example" "Accessibility-Audit-Tool"

Your CSS is so organized, it alphabetizes itself. Variables for variables, mixins for mixins, and a grid system that could land a spaceship.

The app might not do much, but by golly, it will look beautiful while not doing it! Each loading animation is a masterpiece, each hover state a work of art!

Form follows function... but sometimes form goes on vacation and sends postcards! 🎨✨`,

    // Roast 25: The Documentation Dinosaur
    `🔥 WIKI WIZARD 🔥

Look at this documentation dinosaur! Your READMEs have more sections than a newspaper!

Table of Contents, Getting Started, Installation, Usage, API Reference, Contributing, Code of Conduct, FAQ, Troubleshooting, Changelog, License, Acknowledgments...

And that's just for a script that renames files! Each section is meticulously maintained, with examples, screenshots, and animated GIFs showing every possible use case.

Your documentation is so comprehensive, people read it for fun. It's the War and Peace of technical writing - equally long and equally likely to be praised but not actually read!

You haven't just documented your code - you've authored its biography, complete with childhood stories and future aspirations!

In a world of "figure it out," you're here saying "let me explain everything in excruciating detail!" 📖🔍`,

    // Roast 26: The Performance Perfectionist
    `🔥 SPEED DEMON 🔥

Behold, the optimization oracle! Your code runs faster than a cheetah on espresso!

Milliseconds shaved here, nanoseconds optimized there. A function that previously took 0.001 seconds now takes 0.0009 seconds. Progress!

Each repository is a temple to efficiency: "Cache-Everything-Example" "Lazy-Loading-Extravaganza" "Web-Worker-Wonderland"

Your benchmarks are works of art. Charts showing performance improvements so small they're within the margin of error, but you celebrate them like Olympic gold medals!

The app might be simple, but it will render before you finish blinking. Each kilobyte saved is a victory, each millisecond faster is a triumph!

You're not just writing code - you're conducting a symphony of silicon at lightspeed! ⚡🏎️`,

    // Roast 27: The Accessibility Advocate
    `🔥 A11Y AVENGER 🔥

Look at this inclusion innovator! Your code is more accessible than a ramp to everywhere!

ARIA labels for everything, keyboard navigation smoother than butter, and screen reader support so good, blind developers write you thank-you notes.

Each repository is a masterclass in inclusive design: "Color-Contrast-Checker" "Screen-Reader-Demo" "Focus-Management-Finesse"

Your commitment to accessibility is so thorough, even the error messages have alt text. The tab order is so logical, it could solve a Rubik's cube.

The app might be visually simple, but it's semantically rich! Each div is properly labeled, each button announces its purpose, each form field guides with grace!

In a digital world, you're building doors that everyone can open! ♿❤️`,

    // Roast 28: The Internationalization Expert
    `🔥 I18N ICON 🔥

Behold, the localization legend! Your app speaks more languages than a UN interpreter!

Strings files for languages you've never heard of, right-to-left support for scripts that look like art, and pluralization rules that account for languages with 17 grammatical numbers.

Each repository is a Babel tower of translation: "ICU-Message-Format-Examples" "RTL-Layout-Library" "Dynamic-Language-Switching-Demo"

Your commitment to i18n is so complete, even the error messages have culturally appropriate equivalents. "404 Not Found" becomes "找不到页面" becomes "페이지를 찾을 수 없음" becomes "找不到頁面"...

The functionality might be basic, but it will be understood from Tokyo to Timbuktu! Each locale is treated with respect, each translation meticulously crafted!

Building bridges with bytes, one string at a time! 🌐🗣️`,

    // Roast 29: The Web Components Warrior
    `🔥 CUSTOM ELEMENT COMMANDER 🔥

Look at this shadow DOM soldier! Your GitHub is a factory of reusable web components!

<fancy-button>, <animated-card>, <mega-menu> - tags that don't exist but should, brought to life by your custom element magic!

Each repository is a playground of browser standards: "Lit-Element-Learning" "Stencil-Component-Collection" "Vanilla-Web-Components-For-The-Brave"

Your components are so encapsulated, they have their own zip codes. Styles that don't leak, scripts that don't conflict, and APIs cleaner than a surgical room.

The web might still be figuring out web components, but you've already built an entire design system with them! Each custom element is a tiny, self-contained universe!

Pioneering the future of the web, one <my-awesome-thing> at a time! 🔧🌐`,

    // Roast 30: The GraphQL Guru
    `🔥 API ARTISAN 🔥

Behold, the query quarterback! Your GitHub is a gallery of GraphQL greatness!

Schemas more complex than a family tree, resolvers that resolve deeper issues than therapy, and mutations that change data with surgical precision.

Each repository is a study in data fetching finesse: "Apollo-Server-Setup" "Relay-Modern-Example" "GraphQL-Subscriptions-Demo"

Your type definitions are so thorough, TypeScript gets jealous. Each field documented, each enum explained, each interface extending other interfaces in an infinite dance of types.

The frontend might be simple, but the backend API is a work of art! Each query is optimized, each mutation validated, each subscription... well, subscribed!

Shaping data into perfect pyramids, one resolver at a time! 🎯📊`,

    // Roast 31: The WebAssembly Wizard
    `🔥 WASM WONDER 🔥

Look at this binary brilliance! Your GitHub is where JavaScript fears to tread - the land of WebAssembly!

Rust compiled to wasm, C++ running in the browser, and performance gains measured in "holy cow, that's fast!"

Each repository is an expedition into the bleeding edge: "Rust-WebAssembly-Hello-World" "C-Program-In-Browser" "WASM-Porting-Projects"

Your commitment to performance is so extreme, you're literally rewriting JavaScript in lower-level languages just to save a few CPU cycles. Respect!

The setup might be complicated, the toolchain might be finicky, but when it runs... oh, when it runs, it runs like the wind through a field of optimized algorithms!

Bringing native speed to the web, one .wasm file at a time! ⚡🦀`,

    // Roast 32: The PWA Pioneer
    `🔥 PROGRESSIVE WEB PRO 🔥

Behold, the offline overlord! Your apps work everywhere, even when there's nowhere to work from!

Service workers caching everything but the kitchen sink, manifest files declaring app-like intentions, and install prompts that beg for home screen real estate.

Each repository is a lesson in resilient web apps: "Offline-First-Demo" "Background-Sync-Example" "Push-Notification-Playground"

Your commitment to the PWA ethos is so complete, your apps probably work on a Nokia 3310. Maybe. If you squint.

The functionality might be simple, but it will work on a train, in a tunnel, or on a deserted island (with previously cached data, of course!)

Building apps that survive the apocalypse, one cache strategy at a time! 📱🔋`,

    // Roast 33: The Microservices Maestro
    `🔥 DISTRIBUTED SYSTEMS DIRECTOR 🔥

Look at this service splitter! Your monolith has been divided into more microservices than a corporation has departments!

Auth service, user service, notification service, service-for-managing-other-services service - each one doing exactly one thing perfectly.

Each repository is a node in a distributed dance: "Docker-Compose-Microservices" "Kubernetes-Service-Mesh" "Event-Driven-Architecture-Example"

Your system is so distributed, the services need passports to communicate. Network calls flying across containers, messages queuing in brokers, and consensus achieved through complex algorithms.

The overall functionality might be "create user and send email," but by golly, it will involve 17 different services working in harmony!

Orchestrating a symphony of containers, one docker build at a time! 🐳🎶`,

    // Roast 34: The Monorepo Monarch
    `🔥 SINGLE REPO SOVEREIGN 🔥

Behold, the monorepo monarch! All your code lives in one glorious repository, like a digital mansion with many rooms!

Packages, apps, libraries, documentation - all under one roof, sharing dependencies like siblings share clothes.

Your repository structure is a work of organizational art: "packages/" "apps/" "libs/" "tools/" - each folder a kingdom in your united republic of code.

Dependencies are managed with the precision of a Swiss watch. Workspaces configured, scripts orchestrated, and everything building in perfect harmony.

Why maintain multiple repos when you can maintain one gloriously complex one? Centralized control, shared tooling, and the constant fear of breaking everything at once!

Ruling your code kingdom with an iron... package.json! 👑📁`,

    // Roast 35: The Open Source Overlord
    `🔥 FOSS PHILANTHROPIST 🔥

Look at this open source evangelist! Your GitHub is a public park of code, free for all to enjoy and contribute to!

MIT licenses on everything, contribution guidelines welcoming beginners, and issue templates that guide reporters with the patience of a saint.

Each repository is a community in the making: "Good-First-Issue" labels, detailed CONTRIBUTING.md files, and code of conduct statements that promote healthy collaboration.

Your commitment to open source is so pure, you'd probably open source your grocery list if anyone asked. Transparency, collaboration, and shared knowledge - the holy trinity!

The code might be simple, but the spirit is mighty! Each star is a thank you, each fork a promise, each contribution a connection made!

Building the digital commons, one pull request at a time! 🌍🤝`,

    // Roast 36: The CLI Commander
    `🔥 TERMINAL TITAN 🔥

Behold, the command line conqueror! Your tools live in the terminal, where real developers fear to tread!

Colorful output, progress bars that actually progress, and help text so helpful it could solve your life problems.

Each repository is a utility belt of terminal tools: "File-renamer-9000" "Git-alias-collection" "Dotfiles-that-will-blow-your-mind"

Your CLI apps have more flags than a parade. --help outputs that scroll for days, subcommands nested like Russian dolls, and configuration files that configure the configuration.

Why click when you can type? Why GUI when you can TUI? Why easy when you can have 47 command line options?

Bringing the power of the terminal to the masses, one --dry-run at a time! 💻🚀`,

    // Roast 37: The Animation Auteur
    `🔥 MOTION MAESTRO 🔥

Look at this animation artist! Your UIs don't just change state - they dance, they flow, they tell stories!

CSS transitions smoother than jazz, JavaScript animations more fluid than water, and Canvas drawings that could hang in a gallery.

Each repository is a motion graphics studio: "Spring-Physics-Demo" "SVG-Animation-Collection" "WebGL-Experiment-Number-47"

Your attention to detail is so precise, each easing function is carefully chosen, each duration meticulously timed, each keyframe perfectly placed.

The functionality might be "show/hide a div," but the experience is a Broadway production! Entrances, exits, and everything in between choreographed to perfection.

Making the web move with grace, one keyframe at a time! 🎬💫`,

    // Roast 38: The SVG Sorcerer
    `🔥 VECTOR VIRTUOSO 🔥

Behold, the scalable vector shaman! Your graphics are resolution-independent works of digital art!

SVGs so complex they need their own viewBox, paths that draw themselves into existence, and filters that would make Photoshop blush.

Each repository is a vector art gallery: "Animated-SVG-Logo" "Interactive-Data-Visualization" "Procedural-Graphic-Generator"

Your mastery of the <path> element is so complete, you probably dream in cubic Bézier curves. Each coordinate is deliberate, each curve intentional, each fill a calculated choice.

Why use images when you can describe them mathematically? Why pixelate when you can scale infinitely? Why simple when you can have 500-line SVG files?

Drawing with math, one coordinate pair at a time! 📐🎨`,

    // Roast 39: The Audio/Video Virtuoso
    `🔥 MEDIA MAVEN 🔥

Look at this multimedia maestro! Your GitHub is a studio of sights and sounds!

Web Audio API experiments that would make Beethoven proud, WebRTC implementations connecting people across the globe, and video processing that turns webcams into art.

Each repository is a sensory experience: "Audio-Visualizer-Experiment" "Video-Filter-Playground" "Real-Time-Collaboration-Demo"

Your handling of media is so sophisticated, you probably buffer your morning coffee. Codecs decoded, streams managed, and buffers... well, buffered.

Why settle for static when you can have dynamic? Why silent when you can have symphonic? Why still when you can have motion?

Making the web sing and dance, one sample at a time! 🎵🎥`,

    // Roast 40: The Database Doyen
    `🔥 DATA DYNAMO 🔥

Behold, the database dynamo! Your persistence layers are more reliable than the sunrise!

SQL queries optimized by hand, NoSQL schemas designed with care, and migrations that could guide a civilization through technological evolution.

Each repository is a data management masterclass: "Postgres-Performance-Tips" "Redis-Caching-Strategies" "MongoDB-Aggregation-Pipeline-Examples"

Your understanding of data is so deep, you probably index your grocery list. Transactions atomic, relationships normalized, and backups scheduled with religious fervor.

Why store data when you can structure it? Why query when you can optimize? Why persist when you can perfect?

Shaping bytes into meaning, one foreign key at a time! 🗄️🔗`,

    // Roast 41: The API Architect
    `🔥 ENDPOINT ENGINEER 🔥

Look at this interface impresario! Your APIs are contracts written in code, promises kept with precision!

RESTful routes that would make Roy Fielding proud, GraphQL schemas that describe entire universes, and gRPC services that communicate at the speed of light.

Each repository is an API design pattern book: "OpenAPI-Specification-Example" "GraphQL-Best-Practices" "REST-API-Design-Guide"

Your API documentation is so complete, it could be used as a legal document. Each endpoint described, each parameter explained, each response documented down to the last byte.

Why build features when you can build interfaces? Why monolithic when you can be modular? Why coupled when you can be decoupled?

Building bridges between systems, one endpoint at a time! 🌉🔌`,

    // Roast 42: The Error Handling Expert
    `🔥 EXCEPTION EXECUTIVE 🔥

Behold, the failure philosopher! Your code doesn't just work - it fails gracefully!

Try-catch blocks nested like safety nets, error types more specific than a medical diagnosis, and recovery strategies for scenarios that will never happen.

Each repository is a study in defensive programming: "Error-Boundary-Implementation" "Graceful-Degradation-Demo" "Circuit-Breaker-Pattern-Example"

Your error messages are so helpful, they could solve world peace. Context included, suggestions provided, and links to documentation that actually exists.

Why crash when you can recover? Why fail when you can degrade? Why error when you can handle?

Turning failures into features, one catch block at a time! 🛡️🚨`,

    // Roast 43: The Logging Luminary
    `🔥 DIAGNOSTICS DIRECTOR 🔥

Look at this observability overlord! Your applications don't just run - they narrate their entire existence!

Structured logs that could be parsed by AI, metrics collected with scientific precision, and traces that follow requests through your system like bloodhounds.

Each repository is an observability observatory: "ELK-Stack-Setup" "OpenTelemetry-Implementation" "Logging-Best-Practices"

Your logging is so comprehensive, you probably log your log statements. Severity levels assigned, context included, and patterns established for easy analysis.

Why run blind when you can have insight? Why guess when you can measure? Why wonder when you can know?

Illuminating the dark corners of your code, one log line at a time! 🔦📊`,

    // Roast 44: The Build System Boss
    `🔥 COMPILATION COMMANDER 🔥

Behold, the build system baron! Your code doesn't just write itself - it builds itself!

Webpack configurations more complex than the code they bundle, Babel transforms that turn modern JavaScript into... slightly different modern JavaScript, and bundlers that bundle bundlers.

Each repository is a build tool tutorial: "Custom-Webpack-Config" "Babel-Plugin-Development" "Module-Bundling-Comparison"

Your build process is so optimized, it probably builds faster than you can think of what to build. Trees shaken, code split, and assets optimized to within an inch of their lives.

Why write code when you can configure how it's written? Why develop when you can build? Why simple when you can have a 1000-line webpack config?

Transforming source into art, one loader at a time! ⚙️🏗️`,

    // Roast 45: The TypeScript Titan
    `🔥 TYPE TYRANT 🔥

Look at this typing taskmaster! Your JavaScript doesn't just run - it types!

Interfaces describing reality itself, generics generic enough for any situation, and type guards that would make a bouncer jealous.

Each repository is a type system symphony: "Advanced-TypeScript-Types" "Generic-Programming-Examples" "Type-Safe-API-Clients"

Your type definitions are so precise, TypeScript itself probably learns from them. Each variable typed, each function signature documented, and each generic constraint... well, constraining.

Why JavaScript when you can TypeScript? Why dynamic when you can static? Why "it works" when you can "it type-checks"?

Bringing order to JavaScript's chaos, one interface at a time! 📝✅`,

    // Roast 46: The Algorithm Artist
    `🔥 COMPUTATION COMPOSER 🔥

Behold, the algorithm artisan! Your code doesn't just compute - it computes beautifully!

Sorting algorithms implemented for the joy of it, data structures built because they can be, and optimization problems solved... eventually.

Each repository is an algorithms textbook: "Classic-Algorithms-Implementation" "Data-Structures-From-Scratch" "Competitive-Programming-Solutions"

Your understanding of complexity is so deep, you probably think in Big O notation. Time vs space tradeoffs considered, edge cases handled, and brute force solutions avoided like the plague.

Why solve problems when you can solve them optimally? Why work when you can optimize? Why simple when you can be... O(n log n)?

Turning problems into puzzles, one algorithm at a time! 🧩⚡`,

    // Roast 47: The Protocol Professor
    `🔥 NETWORKING NOMAD 🔥

Look at this protocol professor! Your code doesn't just communicate - it communicates properly!

HTTP requests crafted with care, WebSocket connections maintained with diligence, and low-level socket programming that would make a network engineer proud.

Each repository is a networking textbook: "TCP-IP-Implementation-Notes" "HTTP-2-Demo" "Custom-Protocol-Design"

Your understanding of the network stack is so complete, you probably dream in packets. Headers formatted, bodies encoded, and handshakes... well, shaken.

Why high-level when you can go low-level? Why abstract when you can understand? Why easy when you can implement TCP from scratch?

Speaking the language of the internet, one packet at a time! 🌐📡`,

    // Roast 48: The Memory Management Maestro
    `🔥 RESOURCE REGULATOR 🔥

Behold, the memory manager! Your applications don't just use memory - they respect it!

Garbage collection understood at a fundamental level, memory leaks hunted like prey, and allocations optimized to the byte.

Each repository is a memory management manual: "Garbage-Collection-Studies" "Memory-Leak-Detection-Tools" "Optimization-Techniques"

Your relationship with memory is so intimate, you probably know where each byte lives. Heap analyzed, stack traced, and buffers... well, buffered.

Why allocate when you can reuse? Why waste when you can conserve? Why memory when you can have... less memory?

Treating RAM like the precious resource it is, one malloc at a time! 💾🧹`,

    // Roast 49: The Concurrency Connoisseur
    `🔥 PARALLEL PROCESSING PRO 🔥

Look at this parallel programming prodigy! Your code doesn't just run - it runs in multiple places at once!

Threads spun like plates, promises chained like DNA, and async/await used with the precision of a surgeon.

Each repository is a concurrency cookbook: "Multi-threading-Examples" "Async-Patterns-Collection" "Parallel-Computation-Demos"

Your understanding of concurrency is so deep, you probably think in parallel. Race conditions avoided, deadlocks prevented, and synchronization achieved with elegance.

Why sequential when you can parallel? Why single-threaded when you can multi-threaded? Why wait when you can do everything at once?

Making the most of every CPU cycle, one thread at a time! ⚡🧵`,

    // Roast 50: The Full-Stack Philosopher
    `🔥 STACK SAGE 🔥

Behold, the full-stack philosopher! Your GitHub is a complete ecosystem, from database to deployment!

Frontends that talk to backends that talk to databases that talk to other services in an endless digital conversation.

Each repository is a full-stack journey: "React-Node-Postgres-Boilerplate" "Vue-Express-MongoDB-Example" "NextJS-NestJS-Full-Stack"

Your understanding of the stack is so complete, you probably debug production issues in your sleep. CSS styled, JavaScript bundled, APIs designed, databases queried, servers deployed.

Why specialize when you can generalize? Why frontend or backend when you can frontend AND backend? Why simple when you can own the entire stack?

Mastering the digital universe, one layer at a time! 🥞🚀`
  ];

  // Get random roast
  const randomIndex = Math.floor(Math.random() * roasts.length);
  this.logger.log(`Using mock roast #${randomIndex + 1} of ${roasts.length}`);
  return roasts[randomIndex];
}
}