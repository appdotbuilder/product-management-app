import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Product, CreateProductInput, UpdateProductInput } from '../../server/src/schema';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state for creating new products
  const [createFormData, setCreateFormData] = useState<CreateProductInput>({
    nama: '',
    kategori: '',
    harga_beli: 0,
    harga_jual: 0,
    stok: 0,
    deskripsi: null
  });

  // Form state for editing products
  const [editFormData, setEditFormData] = useState<UpdateProductInput>({
    id: 0,
    nama: '',
    kategori: '',
    harga_beli: 0,
    harga_jual: 0,
    stok: 0,
    deskripsi: null
  });

  const loadProducts = useCallback(async () => {
    try {
      const result = await trpc.getProducts.query();
      setProducts(result);
    } catch (error) {
      console.error('Gagal memuat produk:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createProduct.mutate(createFormData);
      setProducts((prev: Product[]) => [...prev, response]);
      setCreateFormData({
        nama: '',
        kategori: '',
        harga_beli: 0,
        harga_jual: 0,
        stok: 0,
        deskripsi: null
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Gagal membuat produk:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.updateProduct.mutate(editFormData);
      setProducts((prev: Product[]) => 
        prev.map((p: Product) => p.id === response.id ? response : p)
      );
      setEditingProduct(null);
    } catch (error) {
      console.error('Gagal mengupdate produk:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    setIsLoading(true);
    try {
      await trpc.deleteProduct.mutate({ id: productId });
      setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== productId));
    } catch (error) {
      console.error('Gagal menghapus produk:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      id: product.id,
      nama: product.nama,
      kategori: product.kategori,
      harga_beli: product.harga_beli,
      harga_jual: product.harga_jual,
      stok: product.stok,
      deskripsi: product.deskripsi
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateProfit = (hargaJual: number, hargaBeli: number) => {
    return hargaJual - hargaBeli;
  };

  const getProfitBadgeVariant = (profit: number) => {
    if (profit > 0) return 'default';
    if (profit === 0) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📦 Manajemen Produk</h1>
          <p className="text-muted-foreground mt-1">
            Kelola inventory dan produk toko Anda
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              ➕ Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="create-nama">Nama Produk</Label>
                <Input
                  id="create-nama"
                  value={createFormData.nama}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateProductInput) => ({ ...prev, nama: e.target.value }))
                  }
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="create-kategori">Kategori</Label>
                <Input
                  id="create-kategori"
                  value={createFormData.kategori}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateProductInput) => ({ ...prev, kategori: e.target.value }))
                  }
                  placeholder="Masukkan kategori produk"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-harga-beli">Harga Beli</Label>
                  <Input
                    id="create-harga-beli"
                    type="number"
                    value={createFormData.harga_beli}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateProductInput) => ({ 
                        ...prev, 
                        harga_beli: parseFloat(e.target.value) || 0 
                      }))
                    }
                    placeholder="0"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-harga-jual">Harga Jual</Label>
                  <Input
                    id="create-harga-jual"
                    type="number"
                    value={createFormData.harga_jual}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateProductInput) => ({ 
                        ...prev, 
                        harga_jual: parseFloat(e.target.value) || 0 
                      }))
                    }
                    placeholder="0"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="create-stok">Stok</Label>
                <Input
                  id="create-stok"
                  type="number"
                  value={createFormData.stok}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateProductInput) => ({ 
                      ...prev, 
                      stok: parseInt(e.target.value) || 0 
                    }))
                  }
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="create-deskripsi">Deskripsi (Opsional)</Label>
                <Textarea
                  id="create-deskripsi"
                  value={createFormData.deskripsi || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCreateFormData((prev: CreateProductInput) => ({
                      ...prev,
                      deskripsi: e.target.value || null
                    }))
                  }
                  placeholder="Deskripsi produk (opsional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? '⏳ Menyimpan...' : '💾 Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  ❌ Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              produk terdaftar
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum: number, p: Product) => sum + p.stok, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              unit tersedia
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                products.reduce((sum: number, p: Product) => sum + (p.harga_beli * p.stok), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              nilai total stok
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Daftar Produk</CardTitle>
          <CardDescription>
            Kelola semua produk di inventory Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">📦 Belum ada produk.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Klik tombol "Tambah Produk" untuk memulai.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Keuntungan</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: Product) => {
                  const profit = calculateProfit(product.harga_jual, product.harga_beli);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{product.nama}</div>
                          {product.deskripsi && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {product.deskripsi}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.kategori}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.harga_beli)}</TableCell>
                      <TableCell>{formatCurrency(product.harga_jual)}</TableCell>
                      <TableCell>
                        <Badge variant={getProfitBadgeVariant(profit)}>
                          {formatCurrency(profit)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stok > 0 ? 'default' : 'destructive'}>
                          {product.stok} unit
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.created_at.toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(product)}
                          >
                            ✏️
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                🗑️
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus produk "{product.nama}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  disabled={isLoading}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {isLoading ? 'Menghapus...' : 'Hapus'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Produk: {editingProduct.nama}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-nama">Nama Produk</Label>
                <Input
                  id="edit-nama"
                  value={editFormData.nama || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({ 
                      ...prev, 
                      nama: e.target.value 
                    }))
                  }
                  placeholder="Masukkan nama produk"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-kategori">Kategori</Label>
                <Input
                  id="edit-kategori"
                  value={editFormData.kategori || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({ 
                      ...prev, 
                      kategori: e.target.value 
                    }))
                  }
                  placeholder="Masukkan kategori produk"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-harga-beli">Harga Beli</Label>
                  <Input
                    id="edit-harga-beli"
                    type="number"
                    value={editFormData.harga_beli || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev: UpdateProductInput) => ({ 
                        ...prev, 
                        harga_beli: parseFloat(e.target.value) || 0 
                      }))
                    }
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-harga-jual">Harga Jual</Label>
                  <Input
                    id="edit-harga-jual"
                    type="number"
                    value={editFormData.harga_jual || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev: UpdateProductInput) => ({ 
                        ...prev, 
                        harga_jual: parseFloat(e.target.value) || 0 
                      }))
                    }
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-stok">Stok</Label>
                <Input
                  id="edit-stok"
                  type="number"
                  value={editFormData.stok || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({ 
                      ...prev, 
                      stok: parseInt(e.target.value) || 0 
                    }))
                  }
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="edit-deskripsi">Deskripsi (Opsional)</Label>
                <Textarea
                  id="edit-deskripsi"
                  value={editFormData.deskripsi || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({
                      ...prev,
                      deskripsi: e.target.value || null
                    }))
                  }
                  placeholder="Deskripsi produk (opsional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingProduct(null)}
                  className="flex-1"
                >
                  ❌ Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default App;