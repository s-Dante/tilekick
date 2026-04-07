"use client"

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    /* Sonido */
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [musicVol, setMusicVol] = useState([70]);
    const [effectsEnabled, setEffectsEnabled] = useState(true);
    const [effectsVol, setEffectsVol] = useState([85]);

    /* Gráficos */
    const [quality, setQuality] = useState("media");
    const [animations, setAnimations] = useState(true);
    const [renderMode, setRenderMode] = useState("3d");

    /* Juego */
    const [notifications, setNotifications] = useState(true);
    const [hints, setHints] = useState(true);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Configuración</h1>

            <Tabs defaultValue="audio">
                <TabsList className="mb-5 w-full">
                    <TabsTrigger value="audio" className="flex-1 text-xl">Sonido</TabsTrigger>
                    <TabsTrigger value="graphics" className="flex-1 text-xl">Gráficos</TabsTrigger>
                    <TabsTrigger value="game" className="flex-1 text-xl">Juego</TabsTrigger>
                </TabsList>

                {/* ── Sonido ──────────────────────────────────────────── */}
                <TabsContent value="audio">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-xl">Sonido</CardTitle>
                            <CardDescription>Ajusta el audio del juego</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Música de fondo</Label>
                                    <p className="text-lgmd text-muted-foreground">Activa o desactiva la música</p>
                                </div>
                                <Switch checked={musicEnabled} onCheckedChange={setMusicEnabled} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">
                                    Volumen — {musicVol[0]}%
                                </Label>
                                <Slider
                                    value={musicVol}
                                    onValueChange={setMusicVol}
                                    max={100} step={1}
                                    disabled={!musicEnabled}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Efectos de sonido</Label>
                                    <p className="text-md text-muted-foreground">Sonidos durante la partida</p>
                                </div>
                                <Switch checked={effectsEnabled} onCheckedChange={setEffectsEnabled} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">
                                    Volumen — {effectsVol[0]}%
                                </Label>
                                <Slider
                                    value={effectsVol}
                                    onValueChange={setEffectsVol}
                                    max={100} step={1}
                                    disabled={!effectsEnabled}
                                />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Gráficos ─────────────────────────────────────────── */}
                <TabsContent value="graphics">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-xl">Gráficos</CardTitle>
                            <CardDescription>Ajusta la calidad visual</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Calidad gráfica</Label>
                                    <p className="text-md text-muted-foreground">Afecta el rendimiento</p>
                                </div>
                                <Select value={quality} onValueChange={setQuality}>
                                    <SelectTrigger className="w-28">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baja">Baja</SelectItem>
                                        <SelectItem value="media">Media</SelectItem>
                                        <SelectItem value="alta">Alta</SelectItem>
                                        <SelectItem value="ultra">Ultra</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Modo de renderizado</Label>
                                    <p className="text-md text-muted-foreground">3D usa más recursos</p>
                                </div>
                                <Select value={renderMode} onValueChange={setRenderMode}>
                                    <SelectTrigger className="w-28">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2d">2D</SelectItem>
                                        <SelectItem value="3d">3D</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Animaciones</Label>
                                    <p className="text-md text-muted-foreground">Transiciones y efectos visuales</p>
                                </div>
                                <Switch checked={animations} onCheckedChange={setAnimations} />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Juego ────────────────────────────────────────────── */}
                <TabsContent value="game">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-xl">Juego</CardTitle>
                            <CardDescription>Preferencias generales</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Notificaciones</Label>
                                    <p className="text-md text-muted-foreground">Avisos de partidas y amigos</p>
                                </div>
                                <Switch checked={notifications} onCheckedChange={setNotifications} />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Pistas de juego</Label>
                                    <p className="text-md text-muted-foreground">Sugerencias durante la partida</p>
                                </div>
                                <Switch checked={hints} onCheckedChange={setHints} />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
