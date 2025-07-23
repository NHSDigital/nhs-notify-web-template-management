/*
 * All supported markdown features
 * Be careful not to auto-format this file
 */
export const markdown = `
# Linebreaks

Without 2 trailing spaces:

Line 1
Line 2
Line 3

With 2 trailing spaces:

Line 4  
Line 5  
Line 6  

# Paragraphs

Paragraph 1

Paragraph 2

Paragraph 3
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tempor vel quam vitae finibus. 

Paragraph above two blank lines


Paragraph below two blank lines

# Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

####### Heading 7
  
    ## Indented Heading

#Heading no space

# Hashes at the end of the line get trimmed     ###  

## Heading directly above a paragraph
Aenean congue venenatis rutrum. Suspendisse vehicula finibus volutpat. Nunc lacinia rhoncus nibh.

# Bold and italics

**Some bold text using asterisks**

__Some bold text using underscores__

*Some italic text using asterisks*

_Some italic text using underscores_

# Lists

Bullets with asterisks:

* Duis finibus tellus augue, ut dapibus orci vehicula id.
* Proin in condimentum tellus, ac elementum ligula.
* Nulla libero nisl, hendrerit vel est quis, efficitur dignissim est.

Bullets with dashes:

- Duis finibus tellus augue, ut dapibus orci vehicula id.
- Proin in condimentum tellus, ac elementum ligula.
- Nulla libero nisl, hendrerit vel est quis, efficitur dignissim est.

Bullets without required spaces:

*bullet 1 no space
*bullet 2 no space
*bullet 3 no space

Ordered list:

1. Praesent rutrum ex vel velit aliquam.
2. Et viverra turpis vestibulum.
3. Pellentesque quis nisi accumsan.

Ordered list without required spaces:

1.Step 1 no space
2.Step 2 no space
3.Step 3 no space

# Image

![NHS Logo](https://assets.nhs.uk/images/nhs-logo.png)

# Links

[Link text](https://en.wikipedia.org/wiki/Markdown)

www.nhs.uk

nhs.uk

https://www.nhs.uk

http://nhs.uk

user@domain.com

Links with < > symbols:

<www.google.com>

<user@domain.com>

# Lines

Horizontal line using 3 asterisks

***

Horizontal line using 3 underscores

___

Horizontal line with less than 3 doesn't render

__
`;
