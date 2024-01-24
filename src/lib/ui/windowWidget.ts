import {Widget} from "../ui/widget";
import {Renderer} from "../rendering/renderer";
import {Colors} from "../utils/colorUtils";
import {ButtonWidget, ButtonWidgetBuilder} from "../ui/buttonWidget";
import {MouseButton} from "../input/mouse";
import {LabelWidgetBuilder} from "../ui/labelWidget";
import {PanelWidget} from "../ui/panelWidget";
import {MathUtils} from "../utils/mathUtils";


export class WindowWidget extends Widget {

    private _title: string
    private _widgets : Map<string, Widget> = new Map<string, Widget>();
    private _open: boolean;
    private _close:boolean;
    private _closeButton: ButtonWidget;
    private _widgetInFocus: Widget

    constructor(x: number, y: number, width: number, height: number) {
        super();
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;

        /*
        this._closeButton =
            new ButtonWidgetBuilder(width - 15, 5, 15,15)
                .withLabel(new LabelWidgetBuilder(2,4)
                    .withLabel("X")
                    .withFont("Time")
                    .withFontSize(12)
                    .withColor(Colors.WHITE())
                    .withHoverColor(Colors.BLACK())
                    .build())
                .withCallBack(() =>{
                    this.close();
                })
                .withColor(Colors.BLACK())
                .withOutlineColor(Colors.BLACK())
                .withHoverColor(Colors.WHITE())
                .build();

         */


    }

    set title(title: string) {
        this._title = title;
    }

    get title(): string {
        return this._title;
    }

    addWidget(widget: Widget): void {

        this._widgets.set(widget.id, widget);
    }

    removeWidget(id: string) : void {
        this._widgets.delete(id);
    }

    close() : void {
        this._close = true;
    }

    open() : void {
        this._close = false;
    }

    mouseMove(x: number, y: number) {

        if (this._close) {
            return
        }


        this._widgets.forEach((widget:Widget)=> {

            if (widget instanceof ButtonWidget) {
                if (MathUtils.isPointWithinQuad({
                    x: x,
                    y: y
                }, widget.x + this._x, widget.y + this._y + 30, widget.width, widget.height)) {
                    widget.isMouseOver = true;
                } else {
                    widget.isMouseOver = false;
                }
            } else if (widget instanceof PanelWidget) {

                let panelWidget : PanelWidget = widget as PanelWidget;

                panelWidget.widgets.forEach((widget: Widget) => {
                    if (MathUtils.isPointWithinQuad({
                        x: x,
                        y: y
                    }, widget.x + this._x, widget.y + this._y + 30, widget.width, widget.height)) {
                        widget.isMouseOver = true;
                    } else {
                        widget.isMouseOver = false;
                    }
                });

            }
        });

    }

    mouseClick(x: number, y: number, mouseButton: MouseButton) {
        if (this._close) {
            return
        }

        this._widgets.forEach((widget: Widget)=> {

            if (widget instanceof ButtonWidget) {
                if (MathUtils.isPointWithinQuad({
                    x: x,
                    y: y
                }, widget.x + this._x, widget.y + this._y + 30, widget.width, widget.height)) {
                    if (mouseButton == MouseButton.LEFT) {
                        if (widget.callBack != null) {
                            widget.invoke();
                        }
                    }


                }
            }  else if (widget instanceof PanelWidget) {

                let panelWidget : PanelWidget = widget as PanelWidget;

                panelWidget.widgets.forEach((widget: Widget) => {
                    if (MathUtils.isPointWithinQuad({
                        x: x,
                        y: y
                    }, widget.x + this._x, widget.y + this._y + 30, widget.width, widget.height)) {

                        if (mouseButton == MouseButton.LEFT) {
                            if (widget.callBack != null) {
                                widget.invoke();
                            }
                        }

                        this._widgetInFocus = widget;
                    }
                });

            }
        });

    }

    getWidgetInFocus() : Widget {
        return this._widgetInFocus;
    }

    render(offsetX: number, offsetY: number): void {

        if (this._close) {
            return
        }

        Renderer.rect(this._x + offsetX - 1, this._y + offsetY - 1, this._width + 2, this._height + 2, Colors.BLACK());
        Renderer.rect(this._x + offsetX, this._y + offsetY, this._width, this._height, Colors.LTGRAY());
        Renderer.rect(this._x + offsetX, this._y + offsetY, this._width, 25, Colors.DRKGRAY());
        Renderer.print(this._title, this._x + offsetX + 5, this._y + offsetY + 15, {family: "Arial", size: 12, color: Colors.WHITE()});

       // this._closeButton.render(this._x, this._y + offsetY );

        offsetY += 30;

        this._widgets.forEach((widget) => {
           widget.render(this._x + offsetX, this._y + offsetY);
        });


    }

    getWidgetById(id: string) : Widget{
        return this._widgets.get(id);
    }
}

export class WindowWidgetBuilder {

    private readonly _windowWidget: WindowWidget;


    constructor(x: number, y: number, width: number, height: number) {
        this._windowWidget = new WindowWidget(x, y, width, height);

        this.addWidget(
            new ButtonWidgetBuilder(width - 20, -25, 15,15)
                .withLabel(new LabelWidgetBuilder(2,4)
                    .withLabel("X")
                    .withFont({family: "Time", size: 12, color: Colors.WHITE()})
                    .withHoverFont({family: "Time", size: 12, color: Colors.BLACK()})
                    .build())
                .withCallBack(() =>{
                    this._windowWidget.close();
                })
                .withColor(Colors.BLACK())
                .withOutlineColor(Colors.BLACK())
                .withHoverColor(Colors.WHITE())
                .build());


        return this;
    }

    withId(id: string) : WindowWidgetBuilder {
        this._windowWidget.id = id;
        return this;
    }

    withTitle(title: string): WindowWidgetBuilder {
        this._windowWidget.title = title;
        return this;
    }

    addWidget(widget: Widget): WindowWidgetBuilder {
        this._windowWidget.addWidget(widget);
        return this;
    }


    build() {
        return this._windowWidget;
    }
}
