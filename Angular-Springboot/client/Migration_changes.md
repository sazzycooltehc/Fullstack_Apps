PS D:\C.S\Coding\Three_Fullstack_Apps> cd Fullstack-AS
PS D:\C.S\Coding\Three_Fullstack_Apps\Fullstack-AS> ng new client
? Would you like to add Angular routing? Yes
? Which stylesheet format would you like to use? SCSS   [ https://sass-lang.com/documentation/syntax#scss
 ]
CREATE client/angular.json (3096 bytes)
CREATE client/package.json (1037 bytes)
CREATE client/README.md (1060 bytes)
CREATE client/tsconfig.json (863 bytes)
CREATE client/.editorconfig (274 bytes)
CREATE client/.gitignore (548 bytes)
CREATE client/.browserslistrc (600 bytes)
CREATE client/karma.conf.js (1423 bytes)
CREATE client/tsconfig.app.json (287 bytes)
CREATE client/tsconfig.spec.json (333 bytes)
CREATE client/.vscode/extensions.json (130 bytes)
CREATE client/.vscode/launch.json (474 bytes)
CREATE client/.vscode/tasks.json (938 bytes)
CREATE client/src/favicon.ico (948 bytes)
CREATE client/src/index.html (292 bytes)
CREATE client/src/main.ts (372 bytes)
CREATE client/src/polyfills.ts (2338 bytes)
CREATE client/src/styles.scss (80 bytes)
CREATE client/src/test.ts (749 bytes)
CREATE client/src/assets/.gitkeep (0 bytes)
CREATE client/src/environments/environment.prod.ts (51 bytes)
CREATE client/src/environments/environment.ts (658 bytes)
CREATE client/src/app/app-routing.module.ts (245 bytes)
CREATE client/src/app/app.module.ts (393 bytes)
CREATE client/src/app/app.component.html (23115 bytes)
CREATE client/src/app/app.component.spec.ts (1073 bytes)
CREATE client/src/app/app.component.ts (211 bytes)
CREATE client/src/app/app.component.scss (0 bytes)
✔ Packages installed successfully.
    Directory is already under version control. Skipping initialization of git.
PS D:\C.S\Coding\Three_Fullstack_Apps\Fullstack-AS> cd client
PS D:\C.S\Coding\Three_Fullstack_Apps\Fullstack-AS\client> ng update
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 14.2.13 to perform the update.
✔ Packages successfully installed.
Using package manager: npm
Collecting installed dependencies...
Found 22 dependencies.
    We analyzed your package.json, there are some packages to update:

      Name                               Version                  Command to update
     --------------------------------------------------------------------------------
      @angular/cli                       14.1.3 -> 15.2.9         ng update @angular/cli@15
      @angular/core                      14.3.0 -> 15.2.9         ng update @angular/core@15

    There might be additional packages which don't provide 'ng update' capabilities that are outdated.
    You can update the additional packages by running the update command of your package manager.
PS D:\C.S\Coding\Three_Fullstack_Apps\Fullstack-AS\client> ng update @angular/cli@15 @angular/core@15
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 15.2.11 to perform the update.
✔ Packages successfully installed.
Using package manager: npm
Collecting installed dependencies...
Found 22 dependencies.

✔ Packages successfully installed.
** Executing migrations of package '@angular/cli' **

> Remove Browserslist configuration files that matches the Angular CLI default configuration.
DELETE .browserslistrc
  Migration completed (1 file modified).

> Remove exported `@angular/platform-server` `renderModule` method.
  The `renderModule` method is now exported by the Angular CLI.
  Migration completed (No changes made).

> Remove no longer needed require calls in Karma builder main file.
UPDATE src/test.ts (459 bytes)
  Migration completed (1 file modified).

> Update TypeScript compiler `target` and set `useDefineForClassFields`.
  These changes are for IDE purposes as TypeScript compiler options `target` and `useDefineForClassFields` are set to `ES2022` and `false` respectively by the Angular CLI.
  To control ECMA version and features use the Browerslist configuration.
UPDATE tsconfig.json (901 bytes)
  Migration completed (1 file modified).

> Remove options from 'angular.json' that are no longer supported by the official builders.
  Migration completed (No changes made).

** Executing migrations of package '@angular/core' **

> In Angular version 15, the deprecated `relativeLinkResolution` config parameter of the Router is removed.
  This migration removes all `relativeLinkResolution` fields from the Router config objects.
  Migration completed (No changes made).

> Since Angular v15, the `RouterLink` contains the logic of the `RouterLinkWithHref` directive.
  This migration replaces all `RouterLinkWithHref` references with `RouterLink`.
  Migration completed (No changes made).

PS D:\C.S\Coding\Three_Fullstack_Apps\Fullstack-AS\client> ng update
Using package manager: npm
Collecting installed dependencies...
Found 22 dependencies.
    We analyzed your package.json, there are some packages to update:

      Name                               Version                  Command to update
     --------------------------------------------------------------------------------
      @angular/cli                       15.2.11 -> 16.2.9        ng update @angular/cli@16
      @angular/core                      15.2.10 -> 16.2.9        ng update @angular/core@16

    There might be additional packages which don't provide 'ng update' capabilities that are outdated.
    You can update the additional packages by running the update command of your package manager.
PS D:\C.S\Coding\Three_Fullstack_Apps\Fullstack-AS\client> ng update @angular/cli@16 @angular/core@16
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 16.2.16 to perform the update.
✔ Packages successfully installed.
Using package manager: npm
Collecting installed dependencies...
Found 22 dependencies.

✔ Packages successfully installed.
** Executing migrations of package '@angular/cli' **

> Remove 'defaultProject' option from workspace configuration.
  The project to use will be determined from the current working directory.
  Migration completed (No changes made).

> Replace removed 'defaultCollection' option in workspace configuration with 'schematicCollections'.
  Migration completed (No changes made).

> Update the '@angular-devkit/build-angular:server' builder configuration to disable 'buildOptimizer' for non optimized builds.
  Migration completed (No changes made).

** Executing migrations of package '@angular/core' **

> In Angular version 15.2, the guard and resolver interfaces (CanActivate, Resolve, etc) were deprecated.
  This migration removes imports and 'implements' clauses that contain them.
  Migration completed (No changes made).

> As of Angular v16, the `moduleId` property of `@Component` is deprecated as it no longer has any effect.
  Migration completed (No changes made).

PS D:\C.S\Coding\Three_Fullstack_Apps\Fullstack-AS\client> 