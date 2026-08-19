---
title: DOM vs BOM
draft: false
tags:
---
![[Pasted image 20260721063256.png|697]]
## Overview

When developing web applications, JavaScript interacts with two important environments:

- **DOM (Document Object Model)** → Represents the HTML document.
- **BOM (Browser Object Model)** → Represents the browser window and its features.

Although they are often used together, they have different responsibilities.

# DOM (Document Object Model)

## Definition

The **Document Object Model (DOM)** is a programming interface that represents an HTML or XML document as a tree of objects.

It allows JavaScript to:

- Read HTML elements
- Modify HTML content
- Change CSS styles
- Create or remove elements
- Handle user events

The DOM is standardized by the W3C.

---

## DOM Structure

```
Window
 └── Document
      ├── html
      │    ├── head
      │    └── body
      │          ├── h1
      │          ├── p
      │          └── div
```

Every HTML element becomes a **Node** inside the DOM tree.

---

## Common DOM Objects

| Object | Description |
|---------|-------------|
| `document` | Represents the current HTML page |
| `Element` | Any HTML element |
| `Node` | Base type of every DOM node |
| `Text` | Text inside an element |
| `DocumentFragment` | Lightweight container for DOM nodes |

---

## Common DOM Methods

```javascript
document.getElementById("id")

document.querySelector(".class")

document.querySelectorAll("div")

document.createElement("p")

element.appendChild(child)

element.remove()

element.setAttribute("href", "#")
```

---

## Example

HTML

```html
<h1 id="title">Hello</h1>
```

JavaScript

```javascript
const title = document.getElementById("title");

title.textContent = "Welcome";

title.style.color = "red";
```

---

## Common DOM Events

```javascript
click

submit

keydown

keyup

mouseover

mouseout

change

input
```

Example

```javascript
button.addEventListener("click", () => {
    console.log("Clicked");
});
```

---

## DOM Use Cases

- Form validation
- Dynamic UI updates
- Single Page Applications (SPA)
- Event handling
- Creating interactive components

---

# BOM (Browser Object Model)

## Definition

The **Browser Object Model (BOM)** provides JavaScript with access to the browser itself rather than the HTML document.

Unlike the DOM, the BOM is **not an official standard**, although modern browsers implement very similar APIs.

The BOM allows interaction with:

- Browser window
- URL
- Browser history
- Screen information
- Storage
- Timers
- Navigation

---

## BOM Structure

```
Window
 ├── Navigator
 ├── Screen
 ├── Location
 ├── History
 ├── LocalStorage
 ├── SessionStorage
 └── Document (DOM)
```

Notice that **Document (DOM)** is actually inside the **Window** object.

---

## Window Object

Everything in the browser starts with:

```javascript
window
```

Examples

```javascript
window.alert("Hello")

window.confirm("Continue?")

window.prompt("Name")

window.open()

window.close()
```

---

## Location Object

Provides information about the current URL.

```javascript
location.href

location.hostname

location.pathname

location.protocol
```

Redirect

```javascript
location.href = "https://example.com";
```

Reload

```javascript
location.reload();
```

---

## History Object

Navigate browser history.

```javascript
history.back()

history.forward()

history.go(-1)
```

---

## Navigator Object

Provides browser information.

```javascript
navigator.userAgent

navigator.language

navigator.platform

navigator.cookieEnabled
```

---

## Screen Object

Provides screen information.

```javascript
screen.width

screen.height

screen.availWidth

screen.availHeight
```

---

## Storage APIs

### Local Storage

Persists even after the browser is closed.

```javascript
localStorage.setItem("theme", "dark");

localStorage.getItem("theme");

localStorage.removeItem("theme");

localStorage.clear();
```

---

### Session Storage

Persists only until the browser tab is closed.

```javascript
sessionStorage.setItem("token", "123");
```

---

## Timers

```javascript
setTimeout(() => {
    console.log("Hello");
}, 1000);

setInterval(() => {
    console.log("Running");
}, 1000);
```

Cancel

```javascript
clearTimeout(id);

clearInterval(id);
```

---

# DOM vs BOM Comparison

| Feature | DOM | BOM |
|----------|-----|-----|
| Full Name | Document Object Model | Browser Object Model |
| Represents | HTML Document | Browser Environment |
| Root Object | `document` | `window` |
| Standardized | Yes (W3C) | No (browser implementations) |
| Main Purpose | Manipulate HTML | Control browser features |
| Works With | Elements, Nodes | Window, History, Location |
| Can Modify HTML | ✅ | ❌ |
| Can Redirect Page | ❌ | ✅ |
| Can Access URL | Limited | ✅ |
| Can Show Alerts | ❌ | ✅ (`window.alert`) |
| Can Access Storage | ❌ | ✅ |
| Used For | UI manipulation | Browser interaction |

---

# Relationship Between DOM and BOM

```
Browser
    │
    ▼
 Window (BOM)
    │
    ├── Location
    ├── History
    ├── Navigator
    ├── Screen
    ├── Storage
    │
    ▼
 Document (DOM)
    │
    ├── html
    ├── body
    ├── div
    └── button
```

The **DOM** is accessed through the `document` object, while the **BOM** is accessed through the `window` object. In fact, `document` is a property of `window`, meaning the DOM exists within the broader browser environment managed by the BOM.

---

# Key Differences

| DOM | BOM |
|-----|-----|
| Focuses on the web page content | Focuses on the browser environment |
| Manipulates HTML elements | Controls browser behavior |
| Uses `document` | Uses `window` |
| Standardized by W3C | Implemented by browsers |
| Supports element selection and modification | Supports navigation, dialogs, timers, and storage |

---

# Summary

- **DOM (Document Object Model)** provides a structured representation of an HTML document and enables JavaScript to read, modify, create, and remove elements dynamically.
- **BOM (Browser Object Model)** exposes browser-specific objects and APIs, allowing JavaScript to interact with the browser window, navigation history, URL, storage, screen information, and timing functions.
- The `window` object is the global entry point in the browser, and the `document` object (DOM) is one of its properties. Therefore, the DOM operates as a component within the broader Browser Object Model.