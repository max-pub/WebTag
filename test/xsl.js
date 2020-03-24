export default new DOMParser().parseFromString(`<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match='/'>
AUT: <xsl:value-of select='.//author'/>
TIT: <xsl:value-of select='.//title'/>
    <input model='/author' value='{.//author}'/>
<br/>
<b contenteditable='true'><xsl:value-of select='.//author'/></b>
</xsl:template>
</xsl:stylesheet>
`, 'text/xml');
