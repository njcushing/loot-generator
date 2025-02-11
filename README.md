<a name="readme-top"></a>

<!-- Project Shields -->

[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- Project Information Overview -->
<br />
<div align="center">
  <h3 align="center">Loot Generator</h3>

  <p align="center">
    An application that allows the user to create a series of items and loot tables, then generate a random number of items from the specified loot table.
    <br />
    <br />
    <!-- <a href="https://njcushing-loot-generator.fly.dev">View Live Demo</a> -->
  </p>
</div>

<!-- Table of Contents -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li>
          <a href="#design">Design</a>
          <ul>
            <li>
                <a href="#interactive">Interactive</a>
                <ul>
                <li><a href="#items">Items</a></li>
                <li><a href="#tables">Tables</a></li>
                <li><a href="#active">Active</a></li>
                </ul>
            </li>
            <li><a href="#json-display">JSON Display</a></li>
          </ul>
        </li>
        <li><a href="#generate">Generate</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- About the Project -->

## About the Project

<!-- ![Overview](image link) -->

This application allows the user to design numerous items and loot tables, then generate a random number of items from the specified loot table. Items and tables each have various properties that can be tuned to affect the outcome of a roll, for example the quantity of an item to add to the existing loot generated and the weighting of an item or subtable that will determine the likelihood it is selected within a loot array.

The application uses a responsive layout; this makes it suitable for many screen sizes.

<!-- <p align="center"><img src="image-link" alt="Mobile layout" style="width:285px;"/></p> -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

### Built With

[![TypeScript][TypeScript]][TypeScript-url]  
[![React][React.js]][React-url]

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

<!-- Getting Started -->

## Getting Started

If you want to get this project running yourself, please follow these steps.

### Prerequisites

-   Install npm and NodeJS by following this [tutorial][npm-nodejs-install-tutorial-url]

### Installation

1. Clone the repository
    ```sh
    git clone https://github.com/njcushing/loot-generator.git
    ```
2. Install the application's dependencies
    ```sh
    npm install
    ```
3. Run the npm script for compiling and starting the application
    ```sh
    npm run start:front
    ```
4. Navigate to the client's domain in your chosen browser

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

<!-- Usage -->

## Usage

### Design

Locate and select the 'Design' tab. This tab should have two subtabs: 'Interactive' and 'JSON'.

<!-- ![Design](image link) -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

#### Interactive

Locate and select the 'Interactive' tab. This part of the application is where new items and tables can be created, and existing ones you have designed can be edited or deleted. The active table can also be set here. This tab should have three subtabs: 'Active', 'Tables' and 'Items'.

<!-- ![Interactive](image link) -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

##### Items

The 'Items' tab is where the user's items can be managed. A new item can be created by clicking the '+' button at the bottom of the tab; this will enter a 'clean' item (with default properties, and no name) at the bottom of the list of items.

An item can be expanded/collapsed by clicking it. When expanded, its properties will be visible and editable:

-   Name: the name of the item that will be displayed at all times in the item's bar.
-   Value: the numeric value of the item (this currently can only be used to sort the generated items).

To delete an item, simply click the delete button on the item's bar.

To filter items by name, type into the search bar above the list of items. This will match items' names as long as any part of the strings match.

<!-- ![Items](image link) -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

##### Tables

Similar to the 'Items' tab, the 'Tables' tab is where the user's tables are managed. They can be created, expanded/collapsed, deleted and filtered in the same way.

The main difference between tables and items is that while items represent a single entry that can be 'rolled' when generating loot and added to the existing loot table, a table acts like a wrapper for items and even other tables to create a heirarchy of nested tables. When generating loot from a table, if a subtable is rolled from the table's 'loot' array, the loot within the rolled table will then be rolled, and this process will happen recursively until an item is selected instead of a table.

In theory, the depth of nested subtables can be infinite. Allowing nested subtables also creates the issue that if a table has a descendant table that is also an ancestor (for example A -> B -> A), an infinite recursion can occur when attempting to roll an item within the base table. To prevent this, it is impossible to set a descendant table in a table's loot array if that descendant table is found at any level of nesting above the current table.

When expanded, a base-level table will only have one property:

-   Name: the name of the table that will be displayed at all times in the table's bar.

<!-- ![Tables](image link) -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

###### Entries

Tables have a 'loot' array, which can only contain 'entries'. An entry can be one of five things:

-   A new entry that has not been set as either a table or an item. This kind of entry will be excluded when generating loot from the table.
-   A 'generic' or 'no id' table entry, which is a table that is not referenced by an id.
-   A 'defined' or 'imported' table entry, which is a table that has been created by the user and is referenced by its id.
-   A 'generic' or 'no id' item entry, which is an item that is not referenced by an id.
-   A 'defined' or 'imported' item entry, which is an item that has been created by the user and is referenced by its id.

A new entry can be created by clicking the '+' button on a table's bar. When a new entry is created, the user can set it to one of the other four options.

When expanded, table and item entries display their properties as defined in the 'Tables' and 'Items' tabs, respectively. However, for entries referenced by their id, these properties cannot be edited; to change them, this must be done at the source in their respective tabs, where as generic entries can have these properties changed directly within the entry.

In addition to the existing properties on defined tables and items, table and item entries have their own mutable properties.

Table entries:

-   Criteria:
    -   Weight: the likelihood the table will be selected when the parent table's 'loot' array is rolled.

Item entries:

-   Quantity:
    -   Min: the minimum quantity of this item to add to the existing generated loot when the item is rolled.
    -   Min: the maximum quantity of this item to add to the existing generated loot when the item is rolled.
-   Criteria:
    -   Weight: the likelihood the item will be selected when the parent table's 'loot' array is rolled.

An entry can be deleted at any time by clicking the delete button on its bar. There is also a button for swapping the entry to a generic entry of the opposing type (e.g. - item to generic table or table to generic item).

The referenced table or item can be changed by clicking the edit button, and the reference can be removed to change the entry to a generic one of its type by clicking the 'remove selection' button, both found on the entry's properties bar.

To upload a base table to the active table so loot can be generated from it, click the upload button on its bar.

<!-- ![Entries](image link) -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

##### Active

The 'Active' tab simply contains a copy of the uploaded table. All of its descendant entries can be seen by expanding them, but none of the properties of the base table or any of its entries can be changed in this tab; it is purely a visual representation of the table for the user's convenience.

<!-- ![Active](image link) -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

#### JSON Display

Text

<!-- ![JSON Display](image link) -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

### Generate

Text

<!-- ![Generate](image link) -->

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

<!-- License -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

<!-- Contact -->

## Contact

Niall Cushing - [LinkedIn][linkedin-url]

Project Link: [https://github.com/njcushing/poker-hand-calculator][project-link]

<p align="right">(<a href="#readme-top">Back to Top</a>)</p>

<!-- Markdown Links & Images -->

[npm-nodejs-install-tutorial-url]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
[project-link]: https://github.com/njcushing/poker-hand-calculator
[license-shield]: https://img.shields.io/github/license/njcushing/poker-hand-calculator.svg?style=for-the-badge
[license-url]: https://github.com/njcushing/poker-hand-calculator/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://linkedin.com/in/niall-cushing
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=FFF
[TypeScript-url]: https://www.typescriptlang.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
